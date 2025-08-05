import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/orders - список заказов с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const productionStatus = searchParams.get('productionStatus')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Построение фильтров
    const where: any = {
      isActive: true,
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(productionStatus && { productionStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search } },
        ]
      })
    }

    // Получение заказов с позициями
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
              template: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.order.count({ where })
    ])

    // Подсчет статистики
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { isActive: true },
      _count: { status: true },
      _sum: { totalAmount: true }
    })

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count.status,
          totalAmount: stat._sum.totalAmount || 0
        }
        return acc
      }, {} as Record<string, { count: number, totalAmount: number }>)
    })

  } catch (error) {
    console.error('Ошибка при получении заказов:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    )
  }
}

// POST /api/orders - создание нового заказа
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Генерация номера заказа
    const today = new Date()
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '')
    const orderCount = await prisma.order.count({
      where: {
        orderDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      }
    })
    const orderNumber = `ORD-${datePrefix}-${String(orderCount + 1).padStart(3, '0')}`

    // Создание заказа
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        notes: data.notes,
        priority: data.priority || 'MEDIUM',
        source: data.source || 'DIRECT',
        createdBy: data.createdBy,
        vatRate: data.vatRate || 20.0,
        applyVat: data.applyVat !== false,
        totalCostNoVat: 0,
        totalVatAmount: 0,
        totalCostWithVat: 0,
        items: {
          create: data.items?.map((item: any) => ({
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            quantity: item.quantity || 1,
            unit: item.unit || 'шт',
            unitPrice: item.unitPrice || 0,
            totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
            productId: item.productId,
            templateId: item.templateId,
            calculationId: item.calculationId,
            calculationParameters: item.calculationParameters,
            estimatedProductionTime: item.estimatedProductionTime || 0
          })) || []
        }
      },
      include: {
        items: {
          include: {
            product: true,
            template: true
          }
        }
      }
    })

    // Обновление общей суммы заказа
    const totalAmount = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const remainingPayment = totalAmount - (data.advancePayment || 0)

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount,
        advancePayment: data.advancePayment || 0,
        remainingPayment,
        paymentStatus: (data.advancePayment || 0) >= totalAmount ? 'PAID' 
                     : (data.advancePayment || 0) > 0 ? 'PARTIAL' 
                     : 'PENDING'
      },
      include: {
        items: {
          include: {
            product: true,
            template: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      data: updatedOrder 
    })

  } catch (error) {
    console.error('Ошибка при создании заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    )
  }
}
