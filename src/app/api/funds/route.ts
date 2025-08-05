import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/funds - получить все фонды
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fundType = searchParams.get('fundType') || undefined
    const status = searchParams.get('status') || undefined
    
    const funds = await prisma.fund.findMany({
      where: {
        isActive: true,
        ...(fundType && { fundType }),
        ...(status && { status })
      },
      include: {
        categories: {
          where: {
            isActive: true
          },
          include: {
            items: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Последние 10 транзакций
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(funds)
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении фондов' },
      { status: 500 }
    )
  }
}

// DELETE /api/funds - удалить фонд(ы)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fundId = searchParams.get('id')
    const deleteAll = searchParams.get('deleteAll') === 'true'
    const keepId = searchParams.get('keepId')

    if (deleteAll) {
      // Удаляем все фонды кроме указанного
      const result = await prisma.fund.updateMany({
        where: {
          ...(keepId && { id: { not: keepId } })
        },
        data: {
          isActive: false
        }
      })
      
      return NextResponse.json({ 
        message: `Удалено ${result.count} фондов`,
        deletedCount: result.count 
      })
    } else if (fundId) {
      // Удаляем конкретный фонд
      await prisma.fund.update({
        where: { id: fundId },
        data: { isActive: false }
      })
      
      return NextResponse.json({ message: 'Фонд удален' })
    } else {
      return NextResponse.json(
        { error: 'Не указан ID фонда или параметр deleteAll' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting funds:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении фондов' },
      { status: 500 }
    )
  }
}

// POST /api/funds - создать новый фонд
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      name,
      description,
      fundType,
      totalAmount,
      startDate,
      endDate,
      categories = []
    } = data

    // Validation
    if (!name || !fundType) {
      return NextResponse.json(
        { error: 'Название и тип фонда обязательны' },
        { status: 400 }
      )
    }

    const fund = await prisma.fund.create({
      data: {
        name,
        description: description || '',
        fundType,
        totalAmount: totalAmount || 0,
        allocatedAmount: 0,
        remainingAmount: totalAmount || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE',
        isActive: true,
        categories: {
          create: categories.map((category: any) => ({
            name: category.name,
            categoryType: category.categoryType,
            plannedAmount: category.plannedAmount || 0,
            actualAmount: 0,
            percentage: category.percentage || null,
            description: category.description || '',
            priority: category.priority || 1,
            isActive: true,
            items: {
              create: (category.items || []).map((item: any) => ({
                name: item.name,
                itemType: item.itemType || 'OTHER',
                amount: item.amount || 0,
                currency: item.currency || 'RUB',
                percentage: item.percentage || null,
                description: item.description || '',
                isRecurring: item.isRecurring || false,
                priority: item.priority || 1
              }))
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    })

    return NextResponse.json(fund, { status: 201 })
  } catch (error: any) {
    console.error('Error creating fund:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании фонда' },
      { status: 500 }
    )
  }
}
