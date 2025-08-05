import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = params
    const { calculationId } = await req.json()

    // Получаем существующий товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Получаем данные калькуляции
    const calculation = await prisma.calculation.findUnique({
      where: { id: calculationId },
      include: {
        template: true,
        bomItems: {
          include: {
            resource: true
          }
        }
      }
    })

    if (!calculation) {
      return NextResponse.json(
        { error: 'Расчет не найден' },
        { status: 404 }
      )
    }

    // Обновляем товар
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        // Обновляем данные о стоимости из калькуляции
        materialCost: calculation.totalCost || 0,
        totalCost: calculation.totalCost || 0,
        
        // Обновляем цену с сохранением той же маржи
        sellingPrice: product.margin > 0 
          ? calculation.totalCost * (1 + product.margin / 100) 
          : calculation.totalPrice || 0,
                
        // Производственные данные
        productionTime: calculation.laborHours || 0,
        
        // Обновляем метаданные
        specifications: JSON.stringify({
          calculationId: calculation.id,
          templateId: calculation.templateId,
          calculationInputData: calculation.inputData,
          lastUpdated: new Date().toISOString()
        })
      }
    })

    // Удаляем все существующие материалы
    await prisma.productMaterialUsage.deleteMany({
      where: { productId }
    })

    // Удаляем все существующие работы
    await prisma.productWorkTypeUsage.deleteMany({
      where: { productId }
    })

    // Создаем новые связи с материалами
    const materialBomItems = calculation.bomItems.filter(item => 
      item.itemType === 'MATERIAL'
    )

    // Преобразуем коды ресурсов в ID материалов
    for (const bomItem of materialBomItems) {
      // Получаем информацию о ресурсе
      const resource = await prisma.resource.findUnique({
        where: { id: bomItem.resourceId }
      })
      
      if (!resource || resource.type !== 'MATERIAL') continue
      
      // Находим соответствующий материал по коду ресурса
      const material = await prisma.materialItem.findFirst({
        where: { 
          name: resource.name,
          isActive: true
        }
      })
      
      if (!material) continue
      
      // Создаем связь продукта с материалом
      await prisma.productMaterialUsage.create({
        data: {
          productId,
          materialItemId: material.id,
          quantity: bomItem.quantity,
          cost: bomItem.totalCost
        }
      })
    }

    // Создаем новые связи с видами работ
    const laborBomItems = calculation.bomItems.filter(item => 
      item.itemType === 'LABOR'
    )

    // Преобразуем коды ресурсов в ID видов работ
    for (const bomItem of laborBomItems) {
      // Получаем информацию о ресурсе
      const resource = await prisma.resource.findUnique({
        where: { id: bomItem.resourceId }
      })
      
      if (!resource || resource.type !== 'LABOR') continue
      
      // Находим соответствующий вид работ по коду ресурса
      const workType = await prisma.workType.findFirst({
        where: { 
          name: resource.name,
          isActive: true
        }
      })
      
      if (!workType) continue
      
      // Создаем связь продукта с видом работы
      await prisma.productWorkTypeUsage.create({
        data: {
          productId,
          workTypeId: workType.id,
          quantity: bomItem.quantity,
          cost: bomItem.totalCost
        }
      })
    }

    // Обновляем статус калькуляции
    await prisma.calculation.update({
      where: { id: calculationId },
      data: {
        status: 'ORDERED',
        orderReference: productId
      }
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error updating product from calculation:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить товар из расчета' },
      { status: 500 }
    )
  }
}
