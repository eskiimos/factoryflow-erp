const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createLadderTemplate() {
  console.log('🪜 Создание шаблона "Деревянная лестница"...')

  try {
    // Создаем шаблон
    const template = await prisma.template.create({
      data: {
        code: 'LADDER_WOOD',
        name: 'Деревянная лестница',
        description: 'Изготовление деревянной лестницы на заказ с возможностью выбора материала и опций',
        category: 'Лестницы',
        subcategory: 'Деревянные',
        basePrice: 50000,
        marginPercent: 30,
        baseLaborTime: 8,
        setupTime: 1,
        department: 'Столярный цех',
        stepByStep: true,
        previewEnabled: true,
        formLayout: JSON.stringify({
          steps: [
            {
              name: 'Размеры',
              fields: ['LENGTH', 'WIDTH', 'HEIGHT', 'STEPS_COUNT']
            },
            {
              name: 'Материалы', 
              fields: ['WOOD_TYPE', 'THICKNESS']
            },
            {
              name: 'Опции',
              fields: ['HAS_HANDRAIL', 'HAS_COATING']
            },
            {
              name: 'Количество',
              fields: ['QUANTITY']
            }
          ]
        }),
        status: 'ACTIVE'
      }
    })

    console.log(`✅ Шаблон создан: ${template.name} (ID: ${template.id})`)

    // Получаем нужные параметры
    const parameters = await prisma.parameter.findMany({
      where: {
        code: {
          in: ['LENGTH', 'WIDTH', 'HEIGHT', 'THICKNESS', 'WOOD_TYPE', 'QUANTITY', 'STEPS_COUNT', 'HAS_HANDRAIL', 'HAS_COATING']
        }
      }
    })

    console.log('📋 Добавление параметров к шаблону...')

    // Привязываем параметры к шаблону с кастомными настройками
    const templateParameters = [
      {
        parameterCode: 'LENGTH',
        displayName: 'Длина лестницы',
        helpText: 'Общая длина лестницы в миллиметрах',
        groupName: 'Основные размеры',
        isRequired: true,
        sortOrder: 1,
        customMinValue: 1000,
        customMaxValue: 4000,
        customDefaultValue: JSON.stringify(2500)
      },
      {
        parameterCode: 'WIDTH',
        displayName: 'Ширина лестницы', 
        helpText: 'Ширина ступеней в миллиметрах',
        groupName: 'Основные размеры',
        isRequired: true,
        sortOrder: 2,
        customMinValue: 600,
        customMaxValue: 1200,
        customDefaultValue: JSON.stringify(800)
      },
      {
        parameterCode: 'HEIGHT',
        displayName: 'Высота подъема',
        helpText: 'Общая высота лестницы в миллиметрах',
        groupName: 'Основные размеры',
        isRequired: true,
        sortOrder: 3,
        customMinValue: 1500,
        customMaxValue: 3500,
        customDefaultValue: JSON.stringify(2800)
      },
      {
        parameterCode: 'STEPS_COUNT',
        displayName: 'Количество ступеней',
        helpText: 'Оставьте пустым для автоматического расчета',
        groupName: 'Основные размеры',
        isRequired: false,
        sortOrder: 4
      },
      {
        parameterCode: 'THICKNESS',
        displayName: 'Толщина ступеней',
        helpText: 'Толщина доски для ступеней',
        groupName: 'Материалы',
        isRequired: true,
        sortOrder: 10,
        customMinValue: 30,
        customMaxValue: 50,
        customDefaultValue: JSON.stringify(40)
      },
      {
        parameterCode: 'WOOD_TYPE',
        displayName: 'Тип древесины',
        helpText: 'Выберите породу дерева',
        groupName: 'Материалы',
        isRequired: true,
        sortOrder: 11
      },
      {
        parameterCode: 'HAS_HANDRAIL',
        displayName: 'Поручни',
        helpText: 'Добавить поручни с обеих сторон',
        groupName: 'Дополнительные опции',
        sortOrder: 20,
        customDefaultValue: JSON.stringify(true)
      },
      {
        parameterCode: 'HAS_COATING',
        displayName: 'Защитное покрытие',
        helpText: 'Лакировка или покраска изделия',
        groupName: 'Дополнительные опции',
        sortOrder: 21,
        customDefaultValue: JSON.stringify(false)
      },
      {
        parameterCode: 'QUANTITY',
        displayName: 'Количество',
        helpText: 'Количество лестниц к изготовлению',
        groupName: 'Заказ',
        isRequired: true,
        sortOrder: 30,
        customMinValue: 1,
        customMaxValue: 20
      }
    ]

    for (const tpData of templateParameters) {
      const parameter = parameters.find(p => p.code === tpData.parameterCode)
      if (parameter) {
        const templateParam = await prisma.templateParameter.create({
          data: {
            templateId: template.id,
            parameterId: parameter.id,
            displayName: tpData.displayName,
            helpText: tpData.helpText,
            groupName: tpData.groupName,
            isRequired: tpData.isRequired,
            sortOrder: tpData.sortOrder,
            customMinValue: tpData.customMinValue,
            customMaxValue: tpData.customMaxValue,
            customDefaultValue: tpData.customDefaultValue
          }
        })
        console.log(`  ✅ Параметр: ${tpData.displayName}`)
      }
    }

    // Получаем формулы
    const formulas = await prisma.formula.findMany({
      where: {
        code: {
          in: ['CALC_VOLUME', 'CALC_STEPS_AUTO', 'CALC_HANDRAIL_LENGTH', 'WOOD_PRICE_MODIFIER', 'CALC_PRODUCTION_TIME', 'QUANTITY_DISCOUNT']
        }
      }
    })

    console.log('🧮 Добавление формул к шаблону...')

    // Привязываем формулы с настройками выполнения
    const templateFormulas = [
      {
        formulaCode: 'CALC_STEPS_AUTO',
        executionOrder: 10,
        outputVariable: 'calculated_steps',
        outputLabel: 'Рассчитанное количество ступеней'
      },
      {
        formulaCode: 'CALC_VOLUME',
        executionOrder: 20,
        outputVariable: 'wood_volume',
        outputLabel: 'Объем древесины'
      },
      {
        formulaCode: 'CALC_HANDRAIL_LENGTH',
        executionOrder: 30,
        outputVariable: 'handrail_length',
        outputLabel: 'Длина поручня'
      },
      {
        formulaCode: 'WOOD_PRICE_MODIFIER',
        executionOrder: 40,
        outputVariable: 'wood_modifier',
        outputLabel: 'Коэффициент цены древесины'
      },
      {
        formulaCode: 'CALC_PRODUCTION_TIME',
        executionOrder: 50,
        outputVariable: 'production_time',
        outputLabel: 'Время производства'
      },
      {
        formulaCode: 'QUANTITY_DISCOUNT',
        executionOrder: 60,
        outputVariable: 'discount_percent',
        outputLabel: 'Скидка за количество'
      }
    ]

    for (const tfData of templateFormulas) {
      const formula = formulas.find(f => f.code === tfData.formulaCode)
      if (formula) {
        const templateFormula = await prisma.templateFormula.create({
          data: {
            templateId: template.id,
            formulaId: formula.id,
            executionOrder: tfData.executionOrder,
            outputVariable: tfData.outputVariable,
            outputLabel: tfData.outputLabel
          }
        })
        console.log(`  ✅ Формула: ${tfData.outputLabel}`)
      }
    }

    // Создаем BOM шаблон
    const bomTemplate = await prisma.bomTemplate.create({
      data: {
        templateId: template.id,
        includeWaste: true,
        includeSetup: true,
        roundQuantities: true
      }
    })

    console.log('📦 Создание шаблона BOM...')

    // Получаем ресурсы
    const resources = await prisma.resource.findMany({
      where: {
        code: {
          in: ['WOOD_PINE_BOARD', 'WOOD_OAK_BOARD', 'SCREW_WOOD', 'CARPENTRY_WORK', 'ASSEMBLY_WORK', 'SURFACE_TREATMENT']
        }
      }
    })

    // Добавляем элементы в BOM шаблон
    const bomItems = [
      {
        resourceCode: 'WOOD_PINE_BOARD',
        quantityFormula: 'wood_volume * wood_modifier * (WOOD_TYPE === "pine" ? 1 : 0)',
        quantityUnit: 'м³',
        groupName: 'Основные материалы',
        includeCondition: 'WOOD_TYPE === "pine"',
        sortOrder: 10
      },
      {
        resourceCode: 'WOOD_OAK_BOARD', 
        quantityFormula: 'wood_volume * wood_modifier * (WOOD_TYPE === "oak" ? 1 : 0)',
        quantityUnit: 'м³',
        groupName: 'Основные материалы',
        includeCondition: 'WOOD_TYPE === "oak"',
        sortOrder: 11
      },
      {
        resourceCode: 'SCREW_WOOD',
        quantityFormula: 'STEPS_COUNT * 8 + (HAS_HANDRAIL ? 20 : 0)',
        quantityUnit: 'шт',
        groupName: 'Крепеж',
        sortOrder: 20
      },
      {
        resourceCode: 'CARPENTRY_WORK',
        quantityFormula: 'production_time * QUANTITY',
        quantityUnit: 'час',
        groupName: 'Работы',
        sortOrder: 30
      },
      {
        resourceCode: 'ASSEMBLY_WORK',
        quantityFormula: '2 * QUANTITY',
        quantityUnit: 'час',
        groupName: 'Работы',
        sortOrder: 31
      },
      {
        resourceCode: 'SURFACE_TREATMENT',
        quantityFormula: 'LENGTH * WIDTH / 1000000 * 2 * QUANTITY',
        quantityUnit: 'м²',
        groupName: 'Услуги',
        includeCondition: 'HAS_COATING === true',
        isOptional: true,
        sortOrder: 40
      }
    ]

    for (const bomData of bomItems) {
      const resource = resources.find(r => r.code === bomData.resourceCode)
      if (resource) {
        const bomItem = await prisma.bomTemplateItem.create({
          data: {
            bomTemplateId: bomTemplate.id,
            resourceId: resource.id,
            quantityFormula: bomData.quantityFormula,
            quantityUnit: bomData.quantityUnit,
            groupName: bomData.groupName,
            includeCondition: bomData.includeCondition,
            isOptional: bomData.isOptional || false,
            sortOrder: bomData.sortOrder
          }
        })
        console.log(`  ✅ BOM элемент: ${resource.name}`)
      }
    }

    console.log('🎉 Шаблон "Деревянная лестница" успешно создан!')
    
    // Показать структуру
    const fullTemplate = await prisma.template.findUnique({
      where: { id: template.id },
      include: {
        parameters: {
          include: { parameter: true },
          orderBy: { sortOrder: 'asc' }
        },
        formulas: {
          include: { formula: true },
          orderBy: { executionOrder: 'asc' }
        },
        bomTemplate: {
          include: {
            items: {
              include: { resource: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    })

    console.log(`📊 Структура шаблона:`)
    console.log(`  - Параметров: ${fullTemplate.parameters.length}`)
    console.log(`  - Формул: ${fullTemplate.formulas.length}`)
    console.log(`  - BOM элементов: ${fullTemplate.bomTemplate.items.length}`)
    console.log(`\n🏷️  ID шаблона: ${template.id}`)

  } catch (error) {
    console.error('❌ Ошибка при создании шаблона:', error)
  }
}

async function main() {
  await createLadderTemplate()
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
