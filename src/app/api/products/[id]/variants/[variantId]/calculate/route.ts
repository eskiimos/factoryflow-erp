import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface VariantPriceCalculation {
  basePrice: number
  variantPrice: number
  optionsPrice: number
  totalPrice: number
  totalCost: number
  margin: number
  productionTime: number
  breakdown: {
    basePriceModifier: number
    selectedOptions: Array<{
      id: string
      name: string
      priceModifier: number
      costModifier: number
      timeModifier: number
    }>
  }
}

// POST /api/products/[id]/variants/[variantId]/calculate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { variantId } = params
    const { selectedOptions = [], quantity = 1 } = await request.json()

    // Получаем продукт и вариант
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        options: {
          where: { isActive: true }
        }
      }
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Вариант продукта не найден' },
        { status: 404 }
      )
    }

    const baseProduct = variant.product
    
    // Базовые значения из продукта
    const basePrice = baseProduct.sellingPrice
    const baseCost = baseProduct.totalCost
    const baseProductionTime = baseProduct.productionTime

    // Применяем модификаторы варианта
    let variantPrice = basePrice
    let variantCost = baseCost
    let variantTime = baseProductionTime

    // Модификатор цены варианта
    if (variant.priceModifierType === 'PERCENTAGE') {
      variantPrice = basePrice * (1 + variant.priceModifier / 100)
    } else {
      variantPrice = basePrice + variant.priceModifier
    }

    // Модификатор себестоимости варианта
    if (variant.costModifierType === 'PERCENTAGE') {
      variantCost = baseCost * (1 + variant.costModifier / 100)
    } else {
      variantCost = baseCost + variant.costModifier
    }

    // Модификатор времени производства варианта
    variantTime = baseProductionTime + variant.productionTimeModifier

    // Применяем выбранные опции
    let optionsPrice = 0
    let optionsCost = 0
    let optionsTime = 0
    const selectedOptionDetails = []

    for (const optionId of selectedOptions) {
      const option = variant.options.find(opt => opt.id === optionId)
      if (!option) continue

      let optionPriceModifier = 0
      let optionCostModifier = 0

      // Модификатор цены опции
      if (option.priceModifierType === 'PERCENTAGE') {
        optionPriceModifier = variantPrice * (option.priceModifier / 100)
      } else {
        optionPriceModifier = option.priceModifier
      }

      // Модификатор себестоимости опции
      if (option.costModifierType === 'PERCENTAGE') {
        optionCostModifier = variantCost * (option.costModifier / 100)
      } else {
        optionCostModifier = option.costModifier
      }

      optionsPrice += optionPriceModifier
      optionsCost += optionCostModifier
      optionsTime += option.productionTimeModifier

      selectedOptionDetails.push({
        id: option.id,
        name: option.name,
        priceModifier: optionPriceModifier,
        costModifier: optionCostModifier,
        timeModifier: option.productionTimeModifier
      })
    }

    // Итоговые расчеты
    const totalPrice = (variantPrice + optionsPrice) * quantity
    const totalCost = (variantCost + optionsCost) * quantity
    const totalTime = (variantTime + optionsTime) * quantity
    const margin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0

    const calculation: VariantPriceCalculation = {
      basePrice: Math.round(basePrice * 100) / 100,
      variantPrice: Math.round(variantPrice * 100) / 100,
      optionsPrice: Math.round(optionsPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      productionTime: Math.round(totalTime * 100) / 100,
      breakdown: {
        basePriceModifier: Math.round((variantPrice - basePrice) * 100) / 100,
        selectedOptions: selectedOptionDetails
      }
    }

    return NextResponse.json({ calculation })
  } catch (error) {
    console.error('Ошибка при расчете цены варианта:', error)
    return NextResponse.json(
      { error: 'Ошибка при расчете цены' },
      { status: 500 }
    )
  }
}
