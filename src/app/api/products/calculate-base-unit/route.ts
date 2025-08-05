import { NextRequest, NextResponse } from 'next/server'
import { BaseUnitCalculator } from '@/lib/base-unit-calculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, baseUnit, sellingPrice } = body

    if (!productId || !baseUnit) {
      return NextResponse.json(
        { success: false, error: 'productId и baseUnit обязательны' },
        { status: 400 }
      )
    }

    // Рассчитываем стоимость на базовую единицу
    const calculation = await BaseUnitCalculator.calculateProductCost(
      productId,
      baseUnit
    )

    // Если указана цена продажи, рассчитываем прибыльность
    if (sellingPrice && sellingPrice > 0) {
      const profitability = BaseUnitCalculator.calculateProfitability(
        calculation.totalCostPerUnit,
        sellingPrice
      )

      calculation.marginPercentage = profitability.marginPercentage
      calculation.profitabilityIndex = profitability.profitabilityIndex
    }

    return NextResponse.json({
      success: true,
      data: calculation
    })
  } catch (error) {
    console.error('Error calculating base unit cost:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка расчета стоимости базовой единицы' },
      { status: 500 }
    )
  }
}

// GET - получить расчет для существующего товара
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const baseUnit = searchParams.get('baseUnit')

    if (!productId || !baseUnit) {
      return NextResponse.json(
        { success: false, error: 'productId и baseUnit обязательны' },
        { status: 400 }
      )
    }

    const calculation = await BaseUnitCalculator.calculateProductCost(
      productId,
      baseUnit
    )

    return NextResponse.json({
      success: true,
      data: calculation
    })
  } catch (error) {
    console.error('Error getting base unit calculation:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка получения расчета' },
      { status: 500 }
    )
  }
}
