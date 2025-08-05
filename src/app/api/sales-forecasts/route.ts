import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sales-forecasts - получить все прогнозы продаж
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const budgetPlanId = searchParams.get('budgetPlanId') || undefined
    const forecastType = searchParams.get('forecastType') || undefined
    
    const salesForecasts = await prisma.salesForecast.findMany({
      where: {
        isActive: true,
        ...(budgetPlanId && { budgetPlanId }),
        ...(forecastType && { forecastType })
      },
      include: {
        budgetPlan: {
          select: {
            id: true,
            name: true
          }
        },
        productForecasts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellingPrice: true
              }
            }
          }
        },
        categoryForecasts: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(salesForecasts)
  } catch (error) {
    console.error('Error fetching sales forecasts:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении прогнозов продаж' },
      { status: 500 }
    )
  }
}

// POST /api/sales-forecasts - создать новый прогноз продаж
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const salesForecast = await prisma.salesForecast.create({
      data: {
        budgetPlanId: data.budgetPlanId || null,
        name: data.name,
        forecastType: data.forecastType || 'QUARTERLY',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней по умолчанию
        periodType: data.periodType || 'QUARTER',
        totalQuantity: data.totalQuantity || 0,
        totalRevenue: data.totalRevenue || 0,
        averagePrice: data.averagePrice || 0,
        growthRate: data.growthRate || 0,
        seasonality: data.seasonality || 0,
        marketTrend: data.marketTrend || 'STABLE',
        confidence: data.confidence || 70,
        methodology: data.methodology || 'STATISTICAL',
        notes: data.notes || '',
        isActive: true
      },
      include: {
        budgetPlan: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(salesForecast, { status: 201 })
  } catch (error: any) {
    console.error('Error creating sales forecast:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании прогноза продаж' },
      { status: 500 }
    )
  }
}
