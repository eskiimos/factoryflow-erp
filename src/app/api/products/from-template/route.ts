import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/products/from-template - создать продукт из шаблона
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { templateId, productData } = data

    // Валидация
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID обязателен' },
        { status: 400 }
      )
    }

    // Загружаем шаблон
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        parameters: true,
        formulas: true,
        bomTemplate: {
          include: {
            items: {
              include: {
                resource: true
              }
            }
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Шаблон не найден' },
        { status: 404 }
      )
    }

    // Создаем продукт
    const product = await prisma.product.create({
      data: {
        name: productData?.name || template.name,
        description: productData?.description || template.description,
        sku: productData?.sku || `AUTO_${Date.now()}`,
        unit: productData?.unit || 'шт',
        type: productData?.type || 'PRODUCT',
        
        // Стоимостные данные из шаблона
        sellingPrice: template.basePrice || 0,
        margin: template.marginPercent || 20,
        currency: template.currency || 'RUB',
        
        // Связь с автошаблоном
        autoTemplateId: templateId,
        
        // Метаданные
        isActive: true,
        
        // Складские данные по умолчанию
        currentStock: 0,
        minStock: 1,
        maxStock: 100,
        
        // Стоимости по умолчанию (будут пересчитаны)
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        productionTime: 0
      }
    })

    // Если есть BOM шаблон, создаем usage записи для продукта
    if (template.bomTemplate?.items) {
      for (const bomItem of template.bomTemplate.items) {
        // Находим ресурс по формуле количества (содержит код ресурса)
        let resourceCode = ''
        if (bomItem.quantityFormula.includes('WOOD_PINE')) {
          resourceCode = 'WOOD_PINE'
        } else if (bomItem.quantityFormula.includes('WOOD_OAK')) {
          resourceCode = 'WOOD_OAK'
        } else if (bomItem.quantityFormula.includes('CUTTING')) {
          resourceCode = 'CUTTING'
        } else if (bomItem.quantityFormula.includes('ASSEMBLY')) {
          resourceCode = 'ASSEMBLY'
        }

        if (resourceCode) {
          const resource = await prisma.resource.findFirst({
            where: { code: resourceCode }
          })

          if (resource) {
            if (resource.type === 'MATERIAL') {
              // Ищем MaterialItem вместо ресурса
              const materialItem = await prisma.materialItem.findFirst({
                where: { 
                  OR: [
                    { name: { contains: resource.name } },
                    { name: { contains: resourceCode.replace('_', ' ') } }
                  ]
                }
              })
              
              if (materialItem) {
                await prisma.productMaterialUsage.create({
                  data: {
                    productId: product.id,
                    materialItemId: materialItem.id,
                    quantity: 1, // Базовое количество, будет пересчитано
                    cost: materialItem.price || 0
                  }
                })
              }
            } else if (resource.type === 'LABOR') {
              // Ищем WorkType по названию
              const workType = await prisma.workType.findFirst({
                where: { 
                  OR: [
                    { name: { contains: resource.name } },
                    { name: { contains: resourceCode.toLowerCase() } }
                  ]
                }
              })
              
              if (workType) {
                await prisma.productWorkTypeUsage.create({
                  data: {
                    productId: product.id,
                    workTypeId: workType.id,
                    quantity: 1, // Базовое время, будет пересчитано
                    cost: workType.hourlyRate || 0,
                    sequence: bomItem.sortOrder || 0
                  }
                })
              }
            }
          }
        }
      }
    }

    console.log(`✅ Продукт создан из шаблона: ${product.name} (${product.id})`)

    return NextResponse.json({
      success: true,
      data: {
        productId: product.id,
        templateId,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku
        }
      }
    })

  } catch (error) {
    console.error('Ошибка создания продукта из шаблона:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Не удалось создать продукт: ${(error as Error)?.message || 'Неизвестная ошибка'}` 
      },
      { status: 500 }
    )
  }
}
