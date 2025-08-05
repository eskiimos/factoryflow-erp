import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/budget-plans - получить все бюджетные планы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    
    const budgetPlans = await prisma.budgetPlan.findMany({
      where: {
        isActive: true,
        ...(status && { status })
      },
      include: {
        salesForecasts: {
          select: {
            id: true,
            name: true,
            totalRevenue: true,
            startDate: true,
            endDate: true
          }
        },
        budgetCategories: {
          select: {
            id: true,
            name: true,
            categoryType: true,
            plannedAmount: true,
            actualAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(budgetPlans)
  } catch (error) {
    console.error('Error fetching budget plans:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении бюджетных планов' },
      { status: 500 }
    )
  }
}

// POST /api/budget-plans - создать новый бюджетный план
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const budgetPlan = await prisma.budgetPlan.create({
      data: {
        name: data.name,
        description: data.description,
        planType: data.planType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'DRAFT',
        totalRevenue: data.totalRevenue || 0,
        totalCosts: data.totalCosts || 0,
        materialCosts: data.materialCosts || 0,
        laborCosts: data.laborCosts || 0,
        overheadCosts: data.overheadCosts || 0,
        targetProfit: data.targetProfit || 0
      },
      include: {
        salesForecasts: true,
        budgetCategories: true
      }
    })

    return NextResponse.json(budgetPlan, { status: 201 })
  } catch (error) {
    console.error('Error creating budget plan:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании бюджетного плана' },
      { status: 500 }
    )
  }
}
