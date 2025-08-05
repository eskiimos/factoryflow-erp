import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Получаем товар со всеми связями
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        materialUsages: {
          include: { materialItem: true }
        },
        workTypeUsages: {
          include: { workType: true }
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
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Проверяем, был ли товар создан из калькуляции
    let calculationId = null
    let templateId = null
    let productParameters = {}
    
    if (product.specifications) {
      try {
        const specs = JSON.parse(product.specifications)
        calculationId = specs.calculationId
        templateId = specs.templateId
        
        if (specs.calculationInputData) {
          productParameters = specs.calculationInputData
        }
      } catch (e) {
        console.error('Ошибка парсинга спецификаций:', e)
      }
    }
    
    // Если нет шаблона калькулятора, попробуем найти подходящий по категории товара
    if (!templateId && product.groupId) {
      const group = await prisma.productGroup.findUnique({ 
        where: { id: product.groupId } 
      })
      
      if (group) {
        const similarTemplate = await prisma.template.findFirst({
          where: {
            category: group.name,
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        })
        
        if (similarTemplate) {
          templateId = similarTemplate.id
        }
      }
    }

    // Возвращаем данные товара, подходящие для калькулятора
    return NextResponse.json({
      product,
      calculation: {
        calculationId,
        templateId,
        parameters: productParameters
      }
    })
  } catch (error) {
    console.error('Error fetching product calculation data:', error)
    return NextResponse.json(
      { error: 'Не удалось получить данные товара для калькулятора' },
      { status: 500 }
    )
  }
}
