import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для пересчета
const RecalculateSchema = z.object({
  parameters: z.record(z.any()),
  quantity: z.number().positive(),
})

// POST /api/orders/calculator/[id]/recalculate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const validatedData = RecalculateSchema.parse(body)
    const orderItemId = id

    // Получаем позицию заказа с продуктом
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        product: true,
        materials: true,
        workTypes: true,
        funds: true,
      }
    })

    if (!orderItem || !orderItem.product) {
      return NextResponse.json(
        { error: 'Позиция заказа не найдена' },
        { status: 404 }
      )
    }

    let effectiveQuantity = validatedData.quantity

    // Если у продукта включен формульный расчет
    if (orderItem.product.formulaEnabled && orderItem.product.formulaExpression) {
      try {
        let formula = orderItem.product.formulaExpression
        
        // Подставляем значения параметров в формулу
        for (const [paramName, paramValue] of Object.entries(validatedData.parameters)) {
          formula = formula.replace(new RegExp(paramName, 'g'), paramValue.toString())
        }
        
        // Простая оценка формулы (в продакшене использовать безопасный парсер)
        effectiveQuantity = eval(formula)
      } catch (error) {
        console.error('Ошибка вычисления формулы:', error)
        effectiveQuantity = validatedData.quantity
      }
    }

    // Обновляем позицию заказа
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        quantity: validatedData.quantity,
        effectiveQuantity,
        calculationParameters: JSON.stringify(validatedData.parameters),
      }
    })

    // Пересчитываем материалы
    for (const material of orderItem.materials) {
      const baseQuantity = material.quantity / (orderItem.effectiveQuantity || orderItem.quantity)
      const newQuantity = baseQuantity * effectiveQuantity
      const newCost = newQuantity * material.priceSnapshot

      await prisma.orderItemMaterial.update({
        where: { id: material.id },
        data: {
          quantity: newQuantity,
          calcCost: newCost,
        }
      })
    }

    // Пересчитываем работы
    for (const workType of orderItem.workTypes) {
      const baseQuantity = workType.quantity / (orderItem.effectiveQuantity || orderItem.quantity)
      const newQuantity = baseQuantity * effectiveQuantity
      const newCost = newQuantity * workType.priceSnapshot

      await prisma.orderItemWorkType.update({
        where: { id: workType.id },
        data: {
          quantity: newQuantity,
          calcCost: newCost,
        }
      })
    }

    // Пересчитываем фонды (если они процентные)
    for (const fund of orderItem.funds) {
      if (fund.fundType === 'percent') {
        // Получаем обновленные материалы и работы
        const updatedMaterials = await prisma.orderItemMaterial.findMany({
          where: { orderItemId }
        })
        const updatedWorkTypes = await prisma.orderItemWorkType.findMany({
          where: { orderItemId }
        })

        const materialsCost = updatedMaterials.reduce((sum, m) => sum + m.calcCost, 0)
        const worksCost = updatedWorkTypes.reduce((sum, w) => sum + w.calcCost, 0)
        const baseCost = materialsCost + worksCost
        const newFundCost = baseCost * (fund.fundValue / 100)

        await prisma.orderItemFund.update({
          where: { id: fund.id },
          data: {
            calcCost: newFundCost,
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      effectiveQuantity,
      message: 'Пересчет выполнен успешно'
    })

  } catch (error) {
    console.error('Ошибка пересчета:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
