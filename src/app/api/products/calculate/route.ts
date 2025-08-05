import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const calculationSchema = z.object({
  productId: z.string().optional(),
  materials: z.array(z.object({
    materialItemId: z.string(),
    quantity: z.number().min(0),
  })).optional(),
  workTypes: z.array(z.object({
    workTypeId: z.string(),
    quantity: z.number().min(0),
  })).optional(),
  overheadRate: z.number().min(0).max(100).default(15), // % накладных расходов
  targetMargin: z.number().min(0).max(100).default(20), // % целевой маржи
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, materials = [], workTypes = [], overheadRate, targetMargin } = calculationSchema.parse(body)

    let materialCosts: any[] = []
    let laborCosts: any[] = []

    // Если передан ID товара, получаем его рецептуру
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          materialUsages: {
            include: {
              materialItem: true,
            },
          },
          workTypeUsages: {
            include: {
              workType: true,
            },
          },
        },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Товар не найден' },
          { status: 404 }
        )
      }

      // Рассчитываем стоимость материалов
      materialCosts = await Promise.all(
        product.materialUsages.map(async usage => {
          const unitCost = usage.materialItem.price
          const totalCost = usage.quantity * unitCost

          return {
            materialItem: usage.materialItem,
            quantity: usage.quantity,
            unitCost,
            totalCost,
          }
        })
      )

      // Рассчитываем стоимость работ
      laborCosts = await Promise.all(
        product.workTypeUsages.map(async usage => {
          const unitCost = usage.workType.hourlyRate
          const totalCost = usage.quantity * unitCost

          return {
            workType: usage.workType,
            quantity: usage.quantity,
            unitCost,
            totalCost,
          }
        })
      )
    } else {
      // Рассчитываем стоимость на основе переданных данных
      if (materials.length > 0) {
        const materialItems = await prisma.materialItem.findMany({
          where: { id: { in: materials.map(m => m.materialItemId) } },
        })

        materialCosts = materials.map(material => {
          const materialItem = materialItems.find(item => item.id === material.materialItemId)
          if (!materialItem) {
            throw new Error(`Материал с ID ${material.materialItemId} не найден`)
          }

          const unitCost = materialItem.price
          const totalCost = material.quantity * unitCost

          return {
            materialItem,
            quantity: material.quantity,
            unitCost,
            totalCost,
          }
        })
      }

      if (workTypes.length > 0) {
        const workTypeItems = await prisma.workType.findMany({
          where: { id: { in: workTypes.map(w => w.workTypeId) } },
        })

        laborCosts = workTypes.map(workType => {
          const workTypeItem = workTypeItems.find(item => item.id === workType.workTypeId)
          if (!workTypeItem) {
            throw new Error(`Вид работы с ID ${workType.workTypeId} не найден`)
          }

          const unitCost = workTypeItem.hourlyRate
          const totalCost = workType.quantity * unitCost

          return {
            workType: workTypeItem,
            quantity: workType.quantity,
            unitCost,
            totalCost,
          }
        })
      }
    }

    // Рассчитываем общие затраты
    const totalMaterialCost = materialCosts.reduce((sum, cost) => sum + cost.totalCost, 0)
    const totalLaborCost = laborCosts.reduce((sum, cost) => sum + cost.totalCost, 0)
    const directCost = totalMaterialCost + totalLaborCost
    const overheadCost = directCost * (overheadRate / 100)
    const totalCost = directCost + overheadCost

    // Рассчитываем рекомендуемую цену
    const suggestedPrice = totalCost * (1 + targetMargin / 100)

    const calculation = {
      materialCosts,
      laborCosts,
      totalMaterialCost,
      totalLaborCost,
      overheadCost,
      totalCost,
      suggestedPrice,
      targetMargin,
      actualMargin: totalCost > 0 ? ((suggestedPrice - totalCost) / totalCost) * 100 : 0,
    }

    return NextResponse.json(calculation)
  } catch (error) {
    console.error('Error calculating product cost:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при расчете стоимости товара' },
      { status: 500 }
    )
  }
}
