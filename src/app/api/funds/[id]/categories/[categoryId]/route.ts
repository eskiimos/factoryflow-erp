import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/funds/[id]/categories/[categoryId] - обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const data = await request.json()
    
    const {
      name,
      categoryType,
      plannedAmount,
      percentage,
      description,
      priority
    } = data

    const category = await prisma.fundCategory.update({
      where: { id: categoryId },
      data: {
        name: name || '',
        categoryType: categoryType || 'OTHER',
        plannedAmount: plannedAmount || 0,
        percentage: percentage || null,
        description: description || '',
        priority: priority || 1,
        updatedAt: new Date()
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении категории' },
      { status: 500 }
    )
  }
}

// DELETE /api/funds/[id]/categories/[categoryId] - удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    console.log('Deleting category with ID:', categoryId)

    const result = await prisma.fundCategory.update({
      where: { id: categoryId },
      data: { isActive: false }
    })
    
    console.log('Category deleted successfully:', result)
    return NextResponse.json({ message: 'Категория удалена' })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении категории' },
      { status: 500 }
    )
  }
}
