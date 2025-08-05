import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/budget-plans/[id] - получить бюджетный план по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetPlan = await prisma.budgetPlan.findUnique({
      where: { id: params.id },
      include: {
        salesForecasts: {
          include: {
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
          }
        },
        budgetCategories: true
      }
    })

    if (!budgetPlan) {
      return NextResponse.json(
        { error: 'Бюджетный план не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(budgetPlan)
  } catch (error) {
    console.error('Error fetching budget plan:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении бюджетного плана' },
      { status: 500 }
    )
  }
}

// PUT /api/budget-plans/[id] - обновить бюджетный план
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const budgetPlan = await prisma.budgetPlan.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        planType: data.planType,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
        totalRevenue: data.totalRevenue,
        totalCosts: data.totalCosts,
        materialCosts: data.materialCosts,
        laborCosts: data.laborCosts,
        overheadCosts: data.overheadCosts,
        targetProfit: data.targetProfit
      },
      include: {
        salesForecasts: true,
        budgetCategories: true
      }
    })

    return NextResponse.json(budgetPlan)
  } catch (error: any) {
    console.error('Error updating budget plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Бюджетный план не найден' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении бюджетного плана' },
      { status: 500 }
    )
  }
}

// DELETE /api/budget-plans/[id] - удалить бюджетный план (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetPlan = await prisma.budgetPlan.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Бюджетный план удален' })
  } catch (error: any) {
    console.error('Error deleting budget plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Бюджетный план не найден' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при удалении бюджетного плана' },
      { status: 500 }
    )
  }
}
