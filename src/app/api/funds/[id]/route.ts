import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/funds/[id] - обновить фонд
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    console.log('Updating fund with ID:', id)
    console.log('Data received:', data)
    
    const {
      name,
      description,
      fundType,
      totalAmount,
      startDate,
      endDate,
      status,
      categories = []
    } = data

    // Validation
    if (!name || !fundType) {
      console.log('Validation failed:', { name, fundType })
      return NextResponse.json(
        { error: 'Название и тип фонда обязательны' },
        { status: 400 }
      )
    }

    console.log('Updating fund in database...')
    
    // Обновляем фонд
    const fund = await prisma.fund.update({
      where: { id },
      data: {
        name,
        description: description || '',
        fundType,
        totalAmount: totalAmount || 0,
        remainingAmount: totalAmount || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'ACTIVE',
        updatedAt: new Date()
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    })

    console.log('Fund updated successfully:', fund.id)
    return NextResponse.json(fund)
  } catch (error: any) {
    console.error('Error updating fund:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении фонда: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/funds/[id] - удалить конкретный фонд
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.fund.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Фонд удален' })
  } catch (error: any) {
    console.error('Error deleting fund:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении фонда' },
      { status: 500 }
    )
  }
}

// GET /api/funds/[id] - получить конкретный фонд
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const fund = await prisma.fund.findUnique({
      where: { 
        id,
        isActive: true
      },
      include: {
        categories: {
          include: {
            items: true
          }
        },
        transactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!fund) {
      return NextResponse.json(
        { error: 'Фонд не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(fund)
  } catch (error: any) {
    console.error('Error fetching fund:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении фонда' },
      { status: 500 }
    )
  }
}
