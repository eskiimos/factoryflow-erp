import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Схема валидации для создания калькулятора позиции
const CreateCalculatorItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().positive(),
  parameters: z.record(z.union([z.string(), z.number()])).optional(), // Значения параметров для формульного расчета
})

// Схема валидации для обновления состава
const UpdateCompositionSchema = z.object({
  materials: z.array(z.object({
    id: z.string().optional(),
    sourceMaterialId: z.string().optional(),
    nameSnapshot: z.string(),
    unitSnapshot: z.string(),
    priceSnapshot: z.number(),
    quantity: z.number(),
  })).optional(),
  workTypes: z.array(z.object({
    id: z.string().optional(),
    sourceWorkTypeId: z.string().optional(),
    nameSnapshot: z.string(),
    unitSnapshot: z.string(),
    priceSnapshot: z.number(),
    quantity: z.number(),
    sequence: z.number().default(0),
  })).optional(),
  funds: z.array(z.object({
    id: z.string().optional(),
    sourceFundId: z.string().optional(),
    nameSnapshot: z.string(),
    fundType: z.enum(['percent', 'fixed']),
    fundValue: z.number(),
  })).optional(),
  markupType: z.enum(['percent', 'absolute']).optional(),
  markupValue: z.number().optional(),
  manualPrice: z.number().optional(),
})

// POST /api/orders/calculator - создание позиции калькулятора
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateCalculatorItemSchema.parse(body)

    // Получаем базовый продукт с составом
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        materialUsages: {
          include: { materialItem: true }
        },
        workTypeUsages: {
          include: { workType: true }
        },
        fundUsages: {
          include: { fund: true }
        },
        parameters: true,
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Продукт не найден' },
        { status: 404 }
      )
    }

    // Расчет эффективного количества для формульных продуктов
    let effectiveQuantity = validatedData.quantity
    
    if (product.formulaEnabled && product.formulaExpression && validatedData.parameters) {
      try {
        // Простой калькулятор формул (можно заменить на более мощный)
        let formula = product.formulaExpression
        
        // Подставляем значения параметров
        for (const [paramName, paramValue] of Object.entries(validatedData.parameters)) {
          formula = formula.replace(new RegExp(paramName, 'g'), paramValue.toString())
        }
        
        // Базовая оценка формулы (в реальном проекте использовать безопасный парсер)
        effectiveQuantity = eval(formula)
      } catch (error) {
        console.error('Ошибка вычисления формулы:', error)
        // Используем обычное количество если формула не сработала
      }
    }

    // Создаем позицию заказа
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: validatedData.orderId,
        productId: validatedData.productId,
        itemName: product.name,
        itemDescription: product.description,
        quantity: validatedData.quantity,
        effectiveQuantity,
        unit: product.unit,
        nameSnapshot: product.name,
        unitSnapshot: product.unit,
        calculationParameters: JSON.stringify(validatedData.parameters || {}),
      }
    })

    // Создаем snapshot материалов
    for (const materialUsage of product.materialUsages) {
      await prisma.orderItemMaterial.create({
        data: {
          orderItemId: orderItem.id,
          sourceMaterialId: materialUsage.materialItemId,
          nameSnapshot: materialUsage.materialItem.name,
          unitSnapshot: materialUsage.materialItem.unit,
          priceSnapshot: materialUsage.materialItem.price,
          quantity: materialUsage.quantity * (effectiveQuantity || validatedData.quantity),
          calcCost: materialUsage.quantity * (effectiveQuantity || validatedData.quantity) * materialUsage.materialItem.price,
        }
      })
    }

    // Создаем snapshot работ
    for (const workUsage of product.workTypeUsages) {
      await prisma.orderItemWorkType.create({
        data: {
          orderItemId: orderItem.id,
          sourceWorkTypeId: workUsage.workTypeId,
          nameSnapshot: workUsage.workType.name,
          unitSnapshot: workUsage.workType.unit,
          priceSnapshot: workUsage.workType.hourlyRate,
          quantity: workUsage.quantity * (effectiveQuantity || validatedData.quantity),
          calcCost: workUsage.quantity * (effectiveQuantity || validatedData.quantity) * workUsage.workType.hourlyRate,
          sequence: workUsage.sequence,
        }
      })
    }

    // Создаем snapshot фондов
    for (const fundUsage of product.fundUsages) {
      await prisma.orderItemFund.create({
        data: {
          orderItemId: orderItem.id,
          sourceFundId: fundUsage.fundId,
          nameSnapshot: fundUsage.fund.name,
          fundType: 'percent', // По умолчанию процентный
          fundValue: fundUsage.percentage || 0,
          calcCost: 0, // Будет рассчитано после создания всех элементов
        }
      })
    }

    // Создаем snapshot параметров
    if (validatedData.parameters) {
      for (const parameter of product.parameters) {
        const value = validatedData.parameters[parameter.name]
        if (value !== undefined) {
          await prisma.orderItemParameterValue.create({
            data: {
              orderItemId: orderItem.id,
              parameterId: parameter.id,
              parameterName: parameter.name,
              value: value.toString(),
              unit: parameter.unit,
            }
          })
        }
      }
    }

    // Рассчитываем общую стоимость позиции
    const materials = await prisma.orderItemMaterial.findMany({
      where: { orderItemId: orderItem.id }
    })
    
    const workTypes = await prisma.orderItemWorkType.findMany({
      where: { orderItemId: orderItem.id }
    })
    
    const materialsCost = materials.reduce((sum, mat) => sum + mat.calcCost, 0)
    const laborCost = workTypes.reduce((sum, work) => sum + work.calcCost, 0)
    const totalCost = materialsCost + laborCost
    
    // Применяем наценку продукта или используем базовую цену
    const unitCost = totalCost > 0 ? totalCost : (product.sellingPrice || product.basePrice || 0)
    const lineCost = unitCost * validatedData.quantity
    
    // Рассчитываем НДС (предполагаем 20%)
    const vatRate = 20
    const linePriceNoVat = lineCost
    const vatAmount = lineCost * (vatRate / 100)
    const linePriceWithVat = lineCost + vatAmount
    
    // Обновляем позицию с рассчитанными ценами
    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: {
        unitCost,
        lineCost,
        linePriceNoVat,
        vatAmount,
        linePriceWithVat,
        markupType: 'percent',
        markupValue: product.margin || 0,
      }
    })

    // Получаем созданную позицию с полным составом для возврата
    const createdItem = await prisma.orderItem.findUnique({
      where: { id: orderItem.id },
      include: {
        materials: true,
        workTypes: true,
        funds: true,
        parameterValues: true,
        product: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: createdItem
    })

  } catch (error) {
    console.error('Ошибка создания позиции калькулятора:', error)
    
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
