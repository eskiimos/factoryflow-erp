import { prisma } from '@/lib/prisma'

export interface BaseUnitCalculation {
  baseUnit: string
  baseUnitSymbol: string
  materialCostPerUnit: number
  laborCostPerUnit: number
  overheadCostPerUnit: number
  totalCostPerUnit: number
  
  // Детализация расчетов
  materialBreakdown: MaterialCostDetail[]
  laborBreakdown: LaborCostDetail[]
  overheadBreakdown: OverheadCostDetail[]
  
  // Метрики эффективности
  profitabilityIndex: number
  marginPercentage: number
}

export interface MaterialCostDetail {
  id: string
  name: string
  usagePerBaseUnit: number
  unit: string
  pricePerUnit: number
  totalCost: number
  conversionFormula?: string
}

export interface LaborCostDetail {
  id: string
  name: string
  timePerBaseUnit: number
  hourlyRate: number
  totalCost: number
  department?: string
}

export interface OverheadCostDetail {
  id: string
  name: string
  costPerBaseUnit: number
  allocationMethod: string
  totalCost: number
}

export class BaseUnitCalculator {
  /**
   * Рассчитывает стоимость товара на базовую единицу измерения
   */
  static async calculateProductCost(
    productId: string,
    baseUnit: string
  ): Promise<BaseUnitCalculation> {
    // Получаем материалы товара
    const materials = await prisma.productMaterialUsage.findMany({
      where: { productId },
      include: {
        material: true
      }
    })

    // Получаем работы товара
    const workTypes = await prisma.productWorkTypeUsage.findMany({
      where: { productId },
      include: {
        workType: {
          include: {
            department: true
          }
        }
      }
    })

    // Получаем фонды товара
    const funds = await prisma.productFundUsage.findMany({
      where: { productId },
      include: {
        fund: true
      }
    })

    // Рассчитываем материалы
    const materialBreakdown: MaterialCostDetail[] = []
    let materialCostPerUnit = 0

    for (const usage of materials) {
      const convertedUsage = await this.convertMaterialUsage(
        usage.quantity,
        usage.material.unit,
        baseUnit
      )

      const totalCost = convertedUsage * usage.material.price
      materialCostPerUnit += totalCost

      materialBreakdown.push({
        id: usage.material.id,
        name: usage.material.name,
        usagePerBaseUnit: convertedUsage,
        unit: usage.material.unit,
        pricePerUnit: usage.material.price,
        totalCost,
        conversionFormula: this.getConversionFormula(usage.material.unit, baseUnit)
      })
    }

    // Рассчитываем работы
    const laborBreakdown: LaborCostDetail[] = []
    let laborCostPerUnit = 0

    for (const usage of workTypes) {
      const convertedTime = await this.convertWorkTime(
        usage.estimatedTime,
        usage.workType.unit,
        baseUnit
      )

      const totalCost = convertedTime * usage.workType.hourlyRate
      laborCostPerUnit += totalCost

      laborBreakdown.push({
        id: usage.workType.id,
        name: usage.workType.name,
        timePerBaseUnit: convertedTime,
        hourlyRate: usage.workType.hourlyRate,
        totalCost,
        department: usage.workType.department?.name
      })
    }

    // Рассчитываем накладные расходы
    const overheadBreakdown: OverheadCostDetail[] = []
    let overheadCostPerUnit = 0

    for (const usage of funds) {
      const costPerUnit = usage.allocatedAmount
      overheadCostPerUnit += costPerUnit

      overheadBreakdown.push({
        id: usage.fund.id,
        name: usage.fund.name,
        costPerBaseUnit: costPerUnit,
        allocationMethod: 'Прямое распределение',
        totalCost: costPerUnit
      })
    }

    const totalCostPerUnit = materialCostPerUnit + laborCostPerUnit + overheadCostPerUnit

    // Получаем информацию о базовой единице
    const baseUnitInfo = await prisma.measurementUnit.findFirst({
      where: { symbol: baseUnit }
    })

    return {
      baseUnit,
      baseUnitSymbol: baseUnitInfo?.symbol || baseUnit,
      materialCostPerUnit,
      laborCostPerUnit,
      overheadCostPerUnit,
      totalCostPerUnit,
      materialBreakdown,
      laborBreakdown,
      overheadBreakdown,
      profitabilityIndex: 0, // Рассчитается позже на основе цены
      marginPercentage: 0
    }
  }

  /**
   * Конвертирует использование материала в базовую единицу
   */
  private static async convertMaterialUsage(
    quantity: number,
    materialUnit: string,
    baseUnit: string
  ): Promise<number> {
    if (materialUnit === baseUnit) {
      return quantity
    }

    // Получаем коэффициенты конвертации
    const fromUnit = await prisma.measurementUnit.findFirst({
      where: { symbol: materialUnit }
    })
    
    const toUnit = await prisma.measurementUnit.findFirst({
      where: { symbol: baseUnit }
    })

    if (!fromUnit || !toUnit) {
      return quantity // Если единицы не найдены, возвращаем как есть
    }

    // Проверяем совместимость типов
    if (fromUnit.type !== toUnit.type) {
      return quantity // Несовместимые типы
    }

    // Конвертируем через базовую единицу типа
    const baseValue = quantity * fromUnit.conversionFactor
    const convertedValue = baseValue / toUnit.conversionFactor

    return convertedValue
  }

  /**
   * Конвертирует время работы в базовую единицу
   */
  private static async convertWorkTime(
    time: number,
    workUnit: string,
    baseUnit: string
  ): Promise<number> {
    // Для работ обычно используются часы, поэтому конвертация проще
    return time
  }

  /**
   * Генерирует формулу конвертации для отображения
   */
  private static getConversionFormula(fromUnit: string, toUnit: string): string {
    if (fromUnit === toUnit) {
      return `1 ${fromUnit} = 1 ${toUnit}`
    }
    return `${fromUnit} → ${toUnit}`
  }

  /**
   * Рассчитывает маржу и прибыльность
   */
  static calculateProfitability(
    costPerUnit: number,
    sellingPricePerUnit: number
  ): { margin: number; marginPercentage: number; profitabilityIndex: number } {
    const margin = sellingPricePerUnit - costPerUnit
    const marginPercentage = costPerUnit > 0 ? (margin / costPerUnit) * 100 : 0
    const profitabilityIndex = costPerUnit > 0 ? sellingPricePerUnit / costPerUnit : 0

    return {
      margin,
      marginPercentage,
      profitabilityIndex
    }
  }
}
