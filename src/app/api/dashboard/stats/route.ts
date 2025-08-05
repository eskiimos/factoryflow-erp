import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/dashboard/stats
export async function GET(request: NextRequest) {
  try {
    const [
      totalMaterials,
      activeCategories,
      materialStats,
      topExpensiveMaterials,
      categoriesWithCount
    ] = await Promise.all([
      // Общее количество активных материалов
      prisma.materialItem.count({
        where: { isActive: true }
      }),
      
      // Количество активных категорий
      prisma.category.count({
        where: { isActive: true }
      }),
      
      // Статистика по ценам
      prisma.materialItem.aggregate({
        where: { isActive: true },
        _avg: { price: true },
        _sum: { price: true },
      }),
      
      // Топ 10 самых дорогих материалов
      prisma.materialItem.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { price: "desc" },
        take: 10,
      }),
      
      // Категории с количеством материалов
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              materialItems: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { name: "asc" },
      })
    ])

    const stats = {
      totalMaterials,
      activeCategories,
      averagePrice: materialStats._avg.price || 0,
      totalValue: materialStats._sum.price || 0,
    }

    const chartData = {
      topExpensiveMaterials: topExpensiveMaterials.map(item => ({
        name: item.name,
        price: item.price,
        category: item.category?.name || 'Без категории',
      })),
      materialsByCategory: categoriesWithCount.map(category => ({
        name: category.name,
        count: category._count.materialItems,
      })),
    }

    return NextResponse.json({
      data: {
        stats,
        charts: chartData,
      },
      success: true,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка получения статистики" },
      { status: 500 }
    )
  }
}
