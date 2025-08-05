import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API для расчета стоимости товара по заданным параметрам
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      productId, 
      dimensions, // { length, width, height, thickness, weight }
      quantity = 1,
      customSpecs = {} // Дополнительные параметры
    } = body

    // Получаем товар со всеми связями
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        materialUsages: {
          include: {
            materialItem: true
          }
        },
        workTypeUsages: {
          include: {
            workType: true
          }
        },
        fundUsages: {
          include: {
            fund: true,
            category: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Расчет площади, объема, веса
    const area = dimensions.length && dimensions.width ? 
      (dimensions.length * dimensions.width) / 10000 : 0 // см² → м²
      
    const volume = dimensions.length && dimensions.width && dimensions.thickness ?
      (dimensions.length * dimensions.width * dimensions.thickness) / 1000000 : 0 // см³ → м³
      
    const weight = dimensions.weight || 0

    let totalMaterialCost = 0
    let totalLaborCost = 0
    let totalOverheadCost = 0
    let totalProductionTime = 0

    const materialCalculations = []
    const laborCalculations = []

    // Расчет материалов
    for (const usage of product.materialUsages) {
      let materialQuantity = usage.baseQuantity || usage.quantity
      let calculatedCost = 0

      switch (usage.unitType) {
        case 'per_area':
          materialQuantity = area * (usage.baseQuantity || 1)
          break
        case 'per_volume':
          materialQuantity = volume * (usage.baseQuantity || 1)
          break
        case 'per_weight':
          materialQuantity = weight * (usage.baseQuantity || 1)
          break
        case 'fixed':
        default:
          materialQuantity = usage.quantity
          break
      }

      // Если есть формула расчета, выполняем её
      if (usage.calculationFormula) {
        try {
          // Безопасная оценка формулы
          const formula = usage.calculationFormula
            .replace(/area/g, area.toString())
            .replace(/volume/g, volume.toString())
            .replace(/weight/g, weight.toString())
            .replace(/thickness/g, (dimensions.thickness || 0).toString())
            .replace(/length/g, (dimensions.length || 0).toString())
            .replace(/width/g, (dimensions.width || 0).toString())

          // Простая проверка безопасности (только числа и операторы)
          if (/^[\d\s+\-*/.()]+$/.test(formula)) {
            materialQuantity = eval(formula)
          }
        } catch (error) {
          console.warn('Ошибка в формуле расчета материала:', error.message)
        }
      }

      calculatedCost = materialQuantity * usage.materialItem.price * quantity
      totalMaterialCost += calculatedCost

      materialCalculations.push({
        materialName: usage.materialItem.name,
        baseQuantity: usage.quantity,
        calculatedQuantity: materialQuantity,
        unitPrice: usage.materialItem.price,
        totalCost: calculatedCost,
        unit: usage.materialItem.unit,
        calculationType: usage.unitType
      })
    }

    // Расчет работ
    for (const usage of product.workTypeUsages) {
      let workTime = usage.baseTime || usage.quantity
      let calculatedCost = 0

      switch (usage.unitType) {
        case 'per_area':
          workTime = area * (usage.baseTime || 1)
          break
        case 'per_volume':
          workTime = volume * (usage.baseTime || 1)
          break
        case 'per_weight':
          workTime = weight * (usage.baseTime || 1)
          break
        case 'fixed':
        default:
          workTime = usage.quantity
          break
      }

      // Если есть формула расчета времени, выполняем её
      if (usage.calculationFormula) {
        try {
          const formula = usage.calculationFormula
            .replace(/area/g, area.toString())
            .replace(/volume/g, volume.toString())
            .replace(/weight/g, weight.toString())
            .replace(/thickness/g, (dimensions.thickness || 0).toString())
            .replace(/length/g, (dimensions.length || 0).toString())
            .replace(/width/g, (dimensions.width || 0).toString())

          if (/^[\d\s+\-*/.()]+$/.test(formula)) {
            workTime = eval(formula)
          }
        } catch (error) {
          console.warn('Ошибка в формуле расчета времени:', error.message)
        }
      }

      calculatedCost = workTime * usage.workType.hourlyRate * quantity
      totalLaborCost += calculatedCost
      totalProductionTime += workTime * quantity

      laborCalculations.push({
        workTypeName: usage.workType.name,
        baseTime: usage.quantity,
        calculatedTime: workTime,
        hourlyRate: usage.workType.hourlyRate,
        totalCost: calculatedCost,
        calculationType: usage.unitType,
        department: usage.workType.department?.name
      })
    }

    // Расчет накладных расходов (фонды)
    for (const usage of product.fundUsages) {
      const overheadCost = usage.allocatedAmount * quantity
      totalOverheadCost += overheadCost
    }

    const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost
    const profitMargin = product.margin || 20
    const sellingPrice = totalCost * (1 + profitMargin / 100)
    const profit = sellingPrice - totalCost

    return NextResponse.json({
      success: true,
      calculation: {
        // Исходные данные
        productId,
        productName: product.name,
        dimensions,
        quantity,
        calculatedMetrics: {
          area: area.toFixed(4),
          volume: volume.toFixed(6),
          weight
        },
        
        // Детализация расчетов
        materials: materialCalculations,
        labor: laborCalculations,
        
        // Итоговые суммы
        costs: {
          materials: totalMaterialCost.toFixed(2),
          labor: totalLaborCost.toFixed(2),
          overhead: totalOverheadCost.toFixed(2),
          total: totalCost.toFixed(2)
        },
        
        // Коммерческие показатели
        pricing: {
          margin: profitMargin,
          sellingPrice: sellingPrice.toFixed(2),
          profit: profit.toFixed(2),
          profitMarginAmount: ((profit / sellingPrice) * 100).toFixed(2)
        },
        
        // Производственные показатели
        production: {
          totalTime: totalProductionTime.toFixed(2),
          timePerUnit: (totalProductionTime / quantity).toFixed(2),
          costPerHour: totalLaborCost > 0 ? (totalLaborCost / totalProductionTime).toFixed(2) : 0
        }
      }
    })

  } catch (error) {
    console.error('Ошибка расчета стоимости:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
