import { prisma } from '@/lib/prisma'
import { 
  ProductBlock, 
  SelectedBlock, 
  GeneratedTemplateResult,
  MaterialBlockConfig,
  WorkTypeBlockConfig, 
  OptionsBlockConfig,
  FormulasBlockConfig
} from '@/lib/types/product-constructor'

/**
 * Генератор шаблонов из блоков конструктора
 * Автоматически создает Template на основе выбранных блоков
 */
export class TemplateGenerator {
  
  /**
   * Генерирует шаблон из блоков
   */
  async generateFromBlocks(
    blocks: SelectedBlock[],
    metadata: {
      name: string
      description?: string
      category?: string
    }
  ): Promise<GeneratedTemplateResult> {
    try {
      console.log('🏗️ Генерация шаблона из блоков:', { blocks: blocks.length, metadata })
      
      // 1. Валидируем блоки
      const validation = this.validateBlocks(blocks)
      if (!validation.isValid) {
        return {
          templateId: '',
          template: {} as any,
          validation,
          preview: { estimatedParameters: 0, estimatedFormulas: 0, estimatedBomItems: 0 }
        }
      }

      // 2. Извлекаем компоненты из блоков
      const parameters = await this.extractParameters(blocks)
      const formulas = await this.generateFormulas(blocks)
      const bomTemplate = await this.createBomTemplate(blocks)

      // 3. Создаем шаблон в базе данных
      const template = await prisma.template.create({
        data: {
          code: `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: metadata.name,
          description: metadata.description || 'Автогенерированный шаблон из блоков',
          category: metadata.category || 'auto-generated',
          status: 'ACTIVE',
          isActive: true,
          version: '1.0',
          basePrice: 0,
          marginPercent: 20,
          currency: 'RUB'
        }
      })

            // 3. Создаем параметры
      for (const paramData of parameters) {
        // Обеспечиваем наличие code
        if (!paramData.code) {
          paramData.code = `${paramData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
        }

        // Создаем или находим существующий параметр
        const parameter = await prisma.parameter.upsert({
          where: { code: paramData.code },
          create: {
            code: paramData.code,
            name: paramData.name,
            type: paramData.type,
            unit: paramData.unit,
            minValue: paramData.minValue,
            maxValue: paramData.maxValue,
            selectOptions: paramData.selectOptions,
            defaultValue: paramData.defaultValue,
            description: paramData.description,
            isRequired: paramData.isRequired,
            validationRegex: paramData.validationRegex,
            validationMessage: paramData.validationMessage
          },
          update: {
            name: paramData.name,
            type: paramData.type,
            unit: paramData.unit,
            minValue: paramData.minValue,
            maxValue: paramData.maxValue,
            selectOptions: paramData.selectOptions,
            defaultValue: paramData.defaultValue,
            description: paramData.description,
            isRequired: paramData.isRequired,
            validationRegex: paramData.validationRegex,
            validationMessage: paramData.validationMessage
          }
        })

        // Создаем связь template-parameter
        await prisma.templateParameter.create({
          data: {
            templateId: template.id,
            parameterId: parameter.id,
            groupName: paramData.groupName,
            sortOrder: paramData.sortOrder
          }
        })
      }

      // 5. Добавляем формулы
      for (const formula of formulas) {
        const formulaData = {
          code: formula.code,
          name: formula.name,
          description: formula.description,
          expression: formula.expression,
          inputParameters: JSON.stringify(formula.inputParameters || []),
          outputType: formula.outputType || 'NUMBER',
          outputUnit: formula.outputUnit,
          roundingMethod: formula.roundingMethod || 'ROUND',
          precision: formula.precision || 2,
          priority: formula.priority || 100,
          conditions: formula.conditions ? JSON.stringify(formula.conditions) : null,
          isActive: true
        }

        const formulaRecord = await prisma.formula.upsert({
          where: { code: formula.code },
          create: formulaData,
          update: formulaData
        })

        await prisma.templateFormula.create({
          data: {
            templateId: template.id,
            formulaId: formulaRecord.id, // Используем id, а не code
            isActive: true,
            executionOrder: formula.executionOrder || 0
          }
        })
      }

      // 6. Создаем BOM шаблон
      if (bomTemplate && bomTemplate.items && bomTemplate.items.length > 0) {
        const bomTemplateRecord = await prisma.bomTemplate.create({
          data: {
            templateId: template.id,
            includeWaste: true,
            includeSetup: true,
            roundQuantities: true
          }
        })

        // Создаем элементы BOM
        for (const rule of bomTemplate.items) {
          await prisma.bomTemplateItem.create({
            data: {
              bomTemplateId: bomTemplateRecord.id,
              resourceId: rule.resourceId,
              quantityFormula: rule.quantityFormula,
              quantityUnit: rule.quantityUnit || 'шт',
              includeCondition: rule.condition || 'true',
              groupName: rule.groupName || 'Материалы',
              sortOrder: rule.sortOrder || 0,
              isOptional: false
            }
          })
        }
      }

      console.log('✅ Шаблон успешно создан:', template.id)

      return {
        templateId: template.id,
        template: {
          name: template.name,
          description: template.description || undefined,
          parameters,
          formulas,
          bomTemplate
        },
        validation,
        preview: {
          estimatedParameters: parameters.length,
          estimatedFormulas: formulas.length,
          estimatedBomItems: this.estimateBomItems(blocks)
        }
      }

    } catch (error) {
      console.error('❌ Ошибка генерации шаблона:', error)
      throw new Error(`Не удалось сгенерировать шаблон: ${(error as Error)?.message || 'Неизвестная ошибка'}`)
    }
  }

  /**
   * Извлекает параметры из блоков опций
   */
  private async extractParameters(blocks: SelectedBlock[]): Promise<any[]> {
    const parameters: any[] = []
    let order = 0

    for (const selectedBlock of blocks) {
      if (selectedBlock.block.type === 'OPTIONS') {
        const config = selectedBlock.block.config as OptionsBlockConfig
        
        for (const param of config.parameters) {
          // Адаптируем к существующей структуре данных в БД
          const parameterData = {
            code: (param as any).name || param.code, // В БД используется name как code
            name: (param as any).label || param.name,
            type: param.type.toUpperCase(),
            unit: param.unit,
            minValue: (param as any).min || param.minValue,
            maxValue: (param as any).max || param.maxValue,
            selectOptions: param.options?.join(','),
            defaultValue: JSON.stringify((param as any).default || param.defaultValue),
            description: param.helpText,
            isRequired: true,
            validationRegex: (param as any).validationRegex,
            validationMessage: (param as any).validationMessage
            // Исключаем groupName и sortOrder - их нет в схеме Parameter
          }

          // Для TemplateParameter храним дополнительные данные
          const templateParamData = {
            groupName: selectedBlock.block.name,
            sortOrder: order++
          }

          parameters.push({ ...parameterData, ...templateParamData })
        }
      }
    }

    // Добавляем базовые параметры, если их нет
    const basicParams = ['length', 'width', 'height', 'quantity']
    for (const basicParam of basicParams) {
      if (!parameters.find(p => p.code === basicParam)) {
        parameters.push({
          code: basicParam,
          name: this.getBasicParamName(basicParam),
          type: 'NUMBER',
          unit: basicParam === 'quantity' ? 'шт' : 'мм',
          minValue: basicParam === 'quantity' ? 1 : 10,
          maxValue: basicParam === 'quantity' ? 1000 : 10000,
          defaultValue: JSON.stringify(basicParam === 'quantity' ? 1 : 1000),
          description: `Базовый параметр: ${this.getBasicParamName(basicParam)}`,
          isRequired: true,
          groupName: 'Базовые параметры',
          sortOrder: order++
        })
      }
    }

    return parameters
  }

  /**
   * Генерирует формулы из блоков
   */
  private async generateFormulas(blocks: SelectedBlock[]): Promise<any[]> {
    const formulas: any[] = []
    let order = 0

    // Базовые расчетные формулы
    formulas.push({
      code: 'area',
      name: 'Площадь',
      expression: 'length * width / 1000000', // мм² в м²
      roundingMethod: 'ROUND',
      precision: 3,
      description: 'Площадь изделия в м²',
      executionOrder: order++
    })

    formulas.push({
      code: 'volume',
      name: 'Объем',
      expression: 'length * width * height / 1000000000', // мм³ в м³
      roundingMethod: 'ROUND',
      precision: 4,
      description: 'Объем изделия в м³',
      executionOrder: order++
    })

    // Формулы из блоков материалов
    for (const selectedBlock of blocks) {
      if (selectedBlock.block.type === 'MATERIALS') {
        const config = selectedBlock.block.config as MaterialBlockConfig
        
        for (const material of config.materials) {
          // Валидируем данные материала
          if (!material.materialCode || !material.name || !material.quantityFormula) {
            console.warn('Пропускаем материал с неполными данными:', material)
            continue
          }

          formulas.push({
            code: `${material.materialCode}_quantity`,
            name: `Количество: ${material.name}`,
            expression: material.quantityFormula,
            roundingMethod: 'CEIL',
            precision: 3,
            description: `Расчет количества материала: ${material.name}`,
            executionOrder: order++
          })

          // Формула с учетом отходов
          if (material.wastePercent && material.wastePercent > 0) {
            formulas.push({
              code: `${material.materialCode}_quantity_with_waste`,
              name: `${material.name} (с отходами)`,
              expression: `${material.materialCode}_quantity * (1 + ${material.wastePercent / 100})`,
              roundingMethod: 'CEIL',
              precision: 3,
              description: `${material.name} с учетом отходов ${material.wastePercent}%`,
              executionOrder: order++
            })
          }
        }
      }

      // Формулы из блоков работ
      if (selectedBlock.block.type === 'WORK_TYPES') {
        const config = selectedBlock.block.config as WorkTypeBlockConfig
        
        for (const workType of config.workTypes) {
          // Валидируем данные работ
          if (!workType.workTypeCode || !workType.name || !workType.timeFormula) {
            console.warn('Пропускаем работу с неполными данными:', workType)
            continue
          }

          formulas.push({
            code: `${workType.workTypeCode}_time`,
            name: `Время: ${workType.name}`,
            expression: workType.timeFormula,
            roundingMethod: 'ROUND',
            precision: 2,
            description: `Расчет времени работы: ${workType.name}`,
            executionOrder: order++
          })
        }
      }

      // Кастомные формулы из блоков
      if (selectedBlock.block.type === 'FORMULAS') {
        const config = selectedBlock.block.config as FormulasBlockConfig
        
        for (const formula of config.formulas) {
          formulas.push({
            code: formula.code,
            name: formula.name,
            expression: formula.expression,
            roundingMethod: formula.roundingMethod,
            precision: formula.precision,
            description: formula.description,
            executionOrder: order++
          })
        }
      }
    }

    return formulas
  }

  /**
   * Создает BOM шаблон
   */
  private async createBomTemplate(blocks: SelectedBlock[]): Promise<any | null> {
    const bomRules: any[] = []

    for (const selectedBlock of blocks) {
      if (selectedBlock.block.type === 'MATERIALS') {
        const config = selectedBlock.block.config as MaterialBlockConfig
        
        for (const material of config.materials) {
          // Ищем ресурс по коду материала
          const resource = await prisma.resource.findFirst({
            where: { 
              code: material.materialCode,
              type: 'MATERIAL'
            }
          })

          if (resource) {
            bomRules.push({
              resourceId: resource.id,
              quantityFormula: `${material.materialCode}_quantity_with_waste || ${material.materialCode}_quantity`,
              quantityUnit: resource.baseUnit,
              condition: material.conditions || 'true',
              groupName: 'Материалы',
              sortOrder: bomRules.length
            })
          }
        }
      }

      if (selectedBlock.block.type === 'WORK_TYPES') {
        const config = selectedBlock.block.config as WorkTypeBlockConfig
        
        for (const workType of config.workTypes) {
          // Ищем ресурс по коду работы
          const resource = await prisma.resource.findFirst({
            where: { 
              code: workType.workTypeCode,
              type: 'LABOR'
            }
          })

          if (resource) {
            bomRules.push({
              resourceId: resource.id,
              quantityFormula: `${workType.workTypeCode}_time`,
              quantityUnit: resource.baseUnit,
              condition: workType.conditions || 'true',
              groupName: 'Работы',
              sortOrder: bomRules.length
            })
          }
        }
      }
    }

    if (bomRules.length === 0) return null

    return {
      items: bomRules
    }
  }

  /**
   * Валидация блоков
   */
  private validateBlocks(blocks: SelectedBlock[]) {
    const errors: string[] = []
    const warnings: string[] = []

    // Проверяем, что есть хотя бы один блок опций
    const hasOptionsBlock = blocks.some(b => b.block.type === 'OPTIONS')
    if (!hasOptionsBlock) {
      warnings.push('Рекомендуется добавить блок с параметрами для лучшей настройки')
    }

    // Проверяем, что есть блоки материалов или работ
    const hasMaterialsOrWork = blocks.some(b => 
      b.block.type === 'MATERIALS' || b.block.type === 'WORK_TYPES'
    )
    if (!hasMaterialsOrWork) {
      errors.push('Необходимо добавить хотя бы один блок материалов или работ')
    }

    // Проверяем дублирование блоков
    const blockIds = blocks.map(b => b.blockId)
    const uniqueBlockIds = new Set(blockIds)
    if (blockIds.length !== uniqueBlockIds.size) {
      warnings.push('Обнаружены дублирующиеся блоки')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Оценка количества элементов BOM
   */
  private estimateBomItems(blocks: SelectedBlock[]): number {
    let count = 0
    
    for (const block of blocks) {
      if (block.block.type === 'MATERIALS') {
        const config = block.block.config as MaterialBlockConfig
        count += config.materials.length
      }
      if (block.block.type === 'WORK_TYPES') {
        const config = block.block.config as WorkTypeBlockConfig
        count += config.workTypes.length
      }
    }
    
    return count
  }

  /**
   * Получить название базового параметра
   */
  private getBasicParamName(code: string): string {
    const names: Record<string, string> = {
      length: 'Длина',
      width: 'Ширина', 
      height: 'Высота',
      quantity: 'Количество'
    }
    return names[code] || code
  }
}

// Экспорт синглтона
export const templateGenerator = new TemplateGenerator()
