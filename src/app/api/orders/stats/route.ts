import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/orders/stats - статистика заказов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, week, month, year
    
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Общая статистика
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue,
      pendingPayments,
      averageOrderValue
    ] = await Promise.all([
      // Общее количество заказов
      prisma.order.count({
        where: { 
          isActive: true,
          orderDate: { gte: startDate }
        }
      }),
      
      // Активные заказы (в работе)
      prisma.order.count({
        where: { 
          isActive: true,
          status: { in: ['CONFIRMED', 'IN_PRODUCTION'] },
          orderDate: { gte: startDate }
        }
      }),
      
      // Завершенные заказы
      prisma.order.count({
        where: { 
          isActive: true,
          status: 'COMPLETED',
          orderDate: { gte: startDate }
        }
      }),
      
      // Общая выручка
      prisma.order.aggregate({
        where: { 
          isActive: true,
          status: 'COMPLETED',
          orderDate: { gte: startDate }
        },
        _sum: { totalAmount: true }
      }),
      
      // Ожидающие оплаты
      prisma.order.aggregate({
        where: { 
          isActive: true,
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
          orderDate: { gte: startDate }
        },
        _sum: { remainingPayment: true }
      }),
      
      // Средний чек
      prisma.order.aggregate({
        where: { 
          isActive: true,
          orderDate: { gte: startDate }
        },
        _avg: { totalAmount: true }
      })
    ])

    // Статистика по статусам
    const statusStats = await prisma.order.groupBy({
      by: ['status'],
      where: { 
        isActive: true,
        orderDate: { gte: startDate }
      },
      _count: { status: true },
      _sum: { totalAmount: true }
    })

    // Статистика по способам оплаты
    const paymentStats = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { 
        isActive: true,
        orderDate: { gte: startDate }
      },
      _count: { paymentStatus: true },
      _sum: { totalAmount: true }
    })

    // Статистика по производству
    const productionStats = await prisma.order.groupBy({
      by: ['productionStatus'],
      where: { 
        isActive: true,
        orderDate: { gte: startDate }
      },
      _count: { productionStatus: true }
    })

    // Динамика заказов по дням (последние 30 дней)
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(orderDate) as date,
        COUNT(*) as ordersCount,
        SUM(totalAmount) as revenue
      FROM orders 
      WHERE isActive = true 
        AND orderDate >= date('now', '-30 days')
      GROUP BY DATE(orderDate)
      ORDER BY date DESC
    `

    // Топ товаров/шаблонов
    const topItems = await prisma.orderItem.groupBy({
      by: ['itemName'],
      where: {
        order: {
          isActive: true,
          orderDate: { gte: startDate }
        }
      },
      _count: { itemName: true },
      _sum: { 
        totalPrice: true,
        quantity: true 
      },
      orderBy: {
        _sum: { totalPrice: 'desc' }
      },
      take: 10
    })

    return NextResponse.json({
      period,
      summary: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingPayments: pendingPayments._sum.remainingPayment || 0,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0
      },
      statusDistribution: statusStats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count.status,
          totalAmount: stat._sum.totalAmount || 0
        }
        return acc
      }, {} as Record<string, { count: number, totalAmount: number }>),
      paymentDistribution: paymentStats.reduce((acc, stat) => {
        acc[stat.paymentStatus] = {
          count: stat._count.paymentStatus,
          totalAmount: stat._sum.totalAmount || 0
        }
        return acc
      }, {} as Record<string, { count: number, totalAmount: number }>),
      productionDistribution: productionStats.reduce((acc, stat) => {
        acc[stat.productionStatus] = stat._count.productionStatus
        return acc
      }, {} as Record<string, number>),
      dailyStats,
      topItems: topItems.map(item => ({
        itemName: item.itemName,
        ordersCount: item._count.itemName,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.totalPrice || 0
      }))
    })

  } catch (error) {
    console.error('Ошибка при получении статистики заказов:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении статистики заказов' },
      { status: 500 }
    )
  }
}
