import { CalculationEngine } from './calculation-engine'

interface CalculationContext {
  [key: string]: any
}

interface CalculationResult {
  templateId: string
  inputData: Record<string, any>
  calculatedValues: Record<string, any>
  totalCost: number
  totalPrice: number
  margin: number
  laborHours: number
  bomItems: any[]
  summary: {
    materialsCost: number
    laborCost: number
    servicesCost: number
    totalDiscount: number
    finalPrice: number
  }
}

interface UnitCalculationContext extends CalculationContext {
  // Основные параметры изделия
  calculationUnit: string   // В чем считается: м², м³, кг, шт
  outputUnit: string       // В чем выводится цена
  baseQuantity: number     // Количество базовых единиц
  
  // Коэффициенты ценообразования
  materialRate: number     // Коэффициент материалов на единицу
  laborRate: number        // Коэффициент работ на единицу
  complexityRate: number   // Коэффициент сложности
}

interface UnitCalculationResult extends CalculationResult {
  // Дополнительные поля для единиц измерения
  calculationUnit: string
  outputUnit: string
  baseQuantity: number
  pricePerUnit: number     // Цена за единицу измерения
  totalUnits: number       // Общее количество единиц
  unitConversion?: {
    from: string
    to: string
    factor: number
    formula?: string
  }
}

export class UnitBasedCalculationEngine {
  private context: UnitCalculationContext
  private engine: CalculationEngine

  constructor(initialData: Record<string, any> = {}) {
    this.context = {
      ...initialData,
      calculationUnit: initialData.calculationUnit || 'шт',
      outputUnit: initialData.outputUnit || 'шт',
      baseQuantity: initialData.baseQuantity || 1,
      materialRate: initialData.materialRate || 1.0,
      laborRate: initialData.laborRate || 1.0,
      complexityRate: initialData.complexityRate || 1.0
    }
    this.engine = new CalculationEngine(initialData)
  }

  /**
   * Расчет количества единиц измерения на основе параметров
   */
  private calculateUnitQuantity(inputData: Record<string, any>, template: any): number {
    const { calculationUnit } = this.context
    
    switch (calculationUnit) {
      case 'м²':
      case 'см²':
        return this.calculateArea(inputData, calculationUnit)
      
      case 'м³':
      case 'см³':
        return this.calculateVolume(inputData, calculationUnit)
      
      case 'м':
      case 'см':
        return this.calculateLength(inputData, calculationUnit)
      
      case 'кг':
        return this.calculateWeight(inputData, template)
      
      case 'шт':
      default:
        return inputData.quantity || 1
    }
  }

  /**
   * Расчет площади
   */
  private calculateArea(inputData: Record<string, any>, unit: string): number {
    const length = inputData.length || inputData.width || 1000  // мм
    const width = inputData.width || inputData.height || 1000   // мм
    
    // Если есть и width и height - используем их
    if (inputData.width && inputData.height) {
      const areaValue = (inputData.width * inputData.height) / 1000000 // м² (из мм)
      return unit === 'см²' ? areaValue * 10000 : areaValue
    }
    
    // Иначе используем length и width
    let area = (length * width) / 1000000 // м²
    
    if (unit === 'см²') {
      area = area * 10000 // конвертация в см²
    }
    
    return area
  }

  /**
   * Расчет объема
   */
  private calculateVolume(inputData: Record<string, any>, unit: string): number {
    const length = inputData.length || 1000 // мм
    const width = inputData.width || 1000   // мм  
    const height = inputData.height || 1000 // мм
    
    let volume = (length * width * height) / 1000000000 // м³
    
    if (unit === 'см³') {
      volume = volume * 1000000 // конвертация в см³
    }
    
    return volume
  }

  /**
   * Расчет длины
   */
  private calculateLength(inputData: Record<string, any>, unit: string): number {
    const length = inputData.length || 1000 // мм
    
    if (unit === 'м') {
      return length / 1000 // конвертация в метры
    } else if (unit === 'см') {
      return length / 10   // конвертация в сантиметры
    }
    
    return length
  }

  /**
   * Расчет веса (требует данные о плотности материала)
   */
  private calculateWeight(inputData: Record<string, any>, template: any): number {
    const volume = this.calculateVolume(inputData, 'м³')
    const density = inputData.material_density || 7800 // кг/м³ для стали по умолчанию
    
    return volume * density
  }

  /**
   * Основной метод расчета с учетом единиц измерения
   */
  async calculateWithUnits(template: any, inputData: Record<string, any>): Promise<UnitCalculationResult> {
    // Устанавливаем контекст единиц измерения из шаблона
    this.context.calculationUnit = template.calculationUnit || 'шт'
    this.context.outputUnit = template.outputUnit || 'шт'
    
    // Рассчитываем количество единиц измерения
    const totalUnits = this.calculateUnitQuantity(inputData, template)
    this.context.baseQuantity = totalUnits
    
    // Обновляем контекст с рассчитанными единицами
    const updatedInputData = {
      ...inputData,
      totalUnits,
      baseQuantity: totalUnits,
      calculationUnit: this.context.calculationUnit,
      outputUnit: this.context.outputUnit
    }

    // Выполняем стандартный расчет
    const standardResult = await this.engine.calculate(template, updatedInputData)
    
    // Рассчитываем цену за единицу
    const pricePerUnit = totalUnits > 0 ? standardResult.totalPrice / totalUnits : 0
    
    // Применяем коэффициенты ценообразования
    const adjustedPrice = this.applyPricingCoefficients(standardResult.totalPrice, totalUnits)
    
    return {
      ...standardResult,
      calculationUnit: this.context.calculationUnit,
      outputUnit: this.context.outputUnit,
      baseQuantity: totalUnits,
      pricePerUnit: adjustedPrice / totalUnits,
      totalUnits,
      totalPrice: adjustedPrice
    }
  }

  /**
   * Применение коэффициентов ценообразования
   */
  private applyPricingCoefficients(basePrice: number, units: number): number {
    const { materialRate, laborRate, complexityRate } = this.context
    
    // Применяем коэффициенты (можно настроить логику)
    let adjustedPrice = basePrice
    
    // Коэффициент сложности влияет на общую цену
    adjustedPrice *= complexityRate
    
    // Коэффициенты материалов и работ влияют пропорционально количеству единиц
    const unitMultiplier = (materialRate + laborRate) / 2
    adjustedPrice *= Math.max(0.5, unitMultiplier) // минимум 50% от базовой цены
    
    return adjustedPrice
  }

  /**
   * Получение информации о единицах измерения
   */
  getUnitInfo(): { calculationUnit: string, outputUnit: string, baseQuantity: number } {
    return {
      calculationUnit: this.context.calculationUnit,
      outputUnit: this.context.outputUnit,
      baseQuantity: this.context.baseQuantity
    }
  }
}

/**
 * Утилита для создания шаблонов с единицами измерения
 */
export class UnitTemplateHelper {
  
  /**
   * Создание шаблона для объемных букв (расчет по площади)
   */
  static createVolumetricLettersTemplate() {
    return {
      calculationUnit: 'см²',
      outputUnit: 'см²',
      pricingFormula: 'area * materialRate * complexityRate + setupCost',
      minimumPrice: 500,
      setupCost: 1000,
      description: 'Объемные буквы - расчет по площади фасада'
    }
  }

  /**
   * Создание шаблона для мебели (расчет по площади)
   */
  static createFurnitureTemplate() {
    return {
      calculationUnit: 'м²',
      outputUnit: 'м²', 
      pricingFormula: 'area * materialCost + laborCost * laborRate',
      minimumPrice: 5000,
      setupCost: 0,
      description: 'Мебель - расчет по площади поверхности'
    }
  }

  /**
   * Создание шаблона для металлоконструкций (расчет по весу)
   */
  static createMetalConstructionTemplate() {
    return {
      calculationUnit: 'кг',
      outputUnit: 'кг',
      pricingFormula: 'weight * materialCost + laborHours * laborRate',
      minimumPrice: 10000,
      setupCost: 5000,
      description: 'Металлоконструкции - расчет по весу металла'
    }
  }
}
