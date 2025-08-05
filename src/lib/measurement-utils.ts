import { prisma } from './prisma'

export interface MeasurementUnit {
  id: string
  name: string
  symbol: string
  type: string
  baseUnit: string
  conversionFactor: number
  isActive: boolean
}

export interface ConversionResult {
  originalValue: number
  convertedValue: number
  fromUnit: string
  toUnit: string
  formula: string
  conversionFactor: number
  type: string
}

export interface ProductDimensions {
  length?: number
  width?: number
  height?: number
  weight?: number
  lengthUnit?: string
  weightUnit?: string
}

/**
 * Основной класс для работы с единицами измерения и расчетами
 */
export class MeasurementCalculator {
  private static unitsCache: MeasurementUnit[] = []
  private static cacheTimestamp = 0
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 минут

  /**
   * Получить все единицы измерения с кешированием
   */
  static async getUnits(forceRefresh = false): Promise<MeasurementUnit[]> {
    const now = Date.now()
    
    if (!forceRefresh && this.unitsCache.length > 0 && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.unitsCache
    }

    try {
      const units = await prisma.measurementUnit.findMany({
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { conversionFactor: 'desc' }]
      })
      
      this.unitsCache = units
      this.cacheTimestamp = now
      return units
    } catch (error) {
      console.error('Error fetching units:', error)
      return this.unitsCache // Возвращаем кешированные данные при ошибке
    }
  }

  /**
   * Найти единицу измерения по символу или названию
   */
  static async findUnit(identifier: string): Promise<MeasurementUnit | null> {
    const units = await this.getUnits()
    return units.find(u => u.symbol === identifier || u.name === identifier) || null
  }

  /**
   * Конвертировать между единицами измерения
   */
  static async convertUnits(
    value: number, 
    fromUnit: string, 
    toUnit: string
  ): Promise<ConversionResult | null> {
    if (fromUnit === toUnit) {
      return {
        originalValue: value,
        convertedValue: value,
        fromUnit,
        toUnit,
        formula: `${value} ${fromUnit} = ${value} ${toUnit}`,
        conversionFactor: 1,
        type: 'same'
      }
    }

    const [fromUnitData, toUnitData] = await Promise.all([
      this.findUnit(fromUnit),
      this.findUnit(toUnit)
    ])

    if (!fromUnitData || !toUnitData) {
      return null
    }

    if (fromUnitData.type !== toUnitData.type || fromUnitData.baseUnit !== toUnitData.baseUnit) {
      return null
    }

    // Конвертируем через базовую единицу
    const baseValue = value * fromUnitData.conversionFactor
    const convertedValue = baseValue / toUnitData.conversionFactor
    const roundedValue = Math.round(convertedValue * 1000000) / 1000000

    return {
      originalValue: value,
      convertedValue: roundedValue,
      fromUnit: fromUnitData.symbol,
      toUnit: toUnitData.symbol,
      formula: `${value} ${fromUnitData.symbol} = ${roundedValue} ${toUnitData.symbol}`,
      conversionFactor: toUnitData.conversionFactor / fromUnitData.conversionFactor,
      type: fromUnitData.type
    }
  }

  /**
   * Вычислить площадь по длине и ширине
   */
  static async calculateArea(
    length: number, 
    width: number, 
    unit: string
  ): Promise<{ area: number; unit: string; formula: string } | null> {
    const unitData = await this.findUnit(unit)
    if (!unitData || unitData.type !== 'length') {
      return null
    }

    const area = length * width
    const areaUnit = this.getAreaUnit(unit)
    
    return {
      area,
      unit: areaUnit,
      formula: `${length} ${unit} × ${width} ${unit} = ${area} ${areaUnit}`
    }
  }

  /**
   * Вычислить объем по длине, ширине и высоте
   */
  static async calculateVolume(
    length: number, 
    width: number, 
    height: number, 
    unit: string
  ): Promise<{ volume: number; unit: string; formula: string } | null> {
    const unitData = await this.findUnit(unit)
    if (!unitData || unitData.type !== 'length') {
      return null
    }

    const volume = length * width * height
    const volumeUnit = this.getVolumeUnit(unit)
    
    return {
      volume,
      unit: volumeUnit,
      formula: `${length} ${unit} × ${width} ${unit} × ${height} ${unit} = ${volume} ${volumeUnit}`
    }
  }

  /**
   * Рассчитать стоимость материала с учетом единиц измерения
   */
  static async calculateMaterialCost(
    quantity: number,
    quantityUnit: string,
    materialPrice: number,
    materialUnit: string
  ): Promise<{ cost: number; formula: string; conversion?: ConversionResult } | null> {
    // Если единицы одинаковые
    if (quantityUnit === materialUnit) {
      const cost = quantity * materialPrice
      return {
        cost,
        formula: `${quantity} ${quantityUnit} × ${materialPrice} ₽/${materialUnit} = ${cost} ₽`
      }
    }

    // Пытаемся конвертировать единицы
    const conversion = await this.convertUnits(quantity, quantityUnit, materialUnit)
    if (!conversion) {
      return null
    }

    const cost = conversion.convertedValue * materialPrice
    return {
      cost,
      formula: `${quantity} ${quantityUnit} = ${conversion.convertedValue} ${materialUnit} × ${materialPrice} ₽/${materialUnit} = ${cost} ₽`,
      conversion
    }
  }

  /**
   * Рассчитать время работы с учетом производительности
   */
  static async calculateWorkTime(
    productParams: ProductDimensions,
    workType: {
      timePerUnit?: number
      productivityRate?: number
      calculationUnit?: string
      unit: string
    }
  ): Promise<{ time: number; formula: string } | null> {
    if (!workType.timePerUnit || !workType.calculationUnit) {
      // Простой расчет по единицам
      return {
        time: workType.timePerUnit || 1,
        formula: `${workType.timePerUnit || 1} ${workType.unit}`
      }
    }

    // Расчет на основе параметров продукта
    let calculationBase = 1

    if (workType.calculationUnit === 'м²' && productParams.length && productParams.width) {
      const areaResult = await this.calculateArea(
        productParams.length, 
        productParams.width, 
        productParams.lengthUnit || 'м'
      )
      if (areaResult) {
        calculationBase = areaResult.area
      }
    } else if (workType.calculationUnit === 'м³' && productParams.length && productParams.width && productParams.height) {
      const volumeResult = await this.calculateVolume(
        productParams.length, 
        productParams.width, 
        productParams.height,
        productParams.lengthUnit || 'м'
      )
      if (volumeResult) {
        calculationBase = volumeResult.volume
      }
    }

    const time = calculationBase * workType.timePerUnit * (workType.productivityRate || 1)
    
    return {
      time,
      formula: `${calculationBase} ${workType.calculationUnit} × ${workType.timePerUnit} ${workType.unit}/${workType.calculationUnit} = ${time} ${workType.unit}`
    }
  }

  /**
   * Получить единицу площади для единицы длины
   */
  private static getAreaUnit(lengthUnit: string): string {
    const areaMap: Record<string, string> = {
      'мм': 'мм²',
      'см': 'см²',
      'м': 'м²',
      'mm': 'mm²',
      'cm': 'cm²',
      'm': 'm²'
    }
    return areaMap[lengthUnit] || `${lengthUnit}²`
  }

  /**
   * Получить единицу объема для единицы длины
   */
  private static getVolumeUnit(lengthUnit: string): string {
    const volumeMap: Record<string, string> = {
      'мм': 'мм³',
      'см': 'см³',
      'м': 'м³',
      'mm': 'mm³',
      'cm': 'cm³',
      'm': 'm³'
    }
    return volumeMap[lengthUnit] || `${lengthUnit}³`
  }

  /**
   * Проверить совместимость единиц измерения
   */
  static async validateUnitCompatibility(unit1: string, unit2: string): Promise<boolean> {
    const [unitData1, unitData2] = await Promise.all([
      this.findUnit(unit1),
      this.findUnit(unit2)
    ])

    if (!unitData1 || !unitData2) {
      return false
    }

    return unitData1.type === unitData2.type && unitData1.baseUnit === unitData2.baseUnit
  }

  /**
   * Получить единицы измерения по типу
   */
  static async getUnitsByType(type: string): Promise<MeasurementUnit[]> {
    const units = await this.getUnits()
    return units.filter(u => u.type === type)
  }

  /**
   * Очистить кеш единиц измерения
   */
  static clearCache(): void {
    this.unitsCache = []
    this.cacheTimestamp = 0
  }
}
