import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: {
        id: id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            materialItems: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Категория не найдена" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка при получении категории" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { name, description, isActive } = body

    // Валидация
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Название категории обязательно" },
        { status: 400 }
      )
    }

    // Проверка существования
    const existingCategory = await prisma.category.findUnique({
      where: { id: id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Категория не найдена" },
        { status: 404 }
      )
    }

    // Проверка уникальности названия (исключая текущую категорию)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
        isActive: true
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: "Категория с таким названием уже существует" },
        { status: 400 }
      )
    }

    // Обновление
    const category = await prisma.category.update({
      where: { id: id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: "Категория успешно обновлена"
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка при обновлении категории" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - удалить категорию (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Проверка существования
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            materialItems: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Категория не найдена" },
        { status: 404 }
      )
    }

    // Проверка связанных данных
    if (existingCategory._count.materialItems > 0) {
      return NextResponse.json(
        { success: false, message: "Нельзя удалить категорию, в которой есть материалы" },
        { status: 400 }
      )
    }

    // Мягкое удаление
    await prisma.category.update({
      where: { id: id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: "Категория успешно удалена"
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка при удалении категории" },
      { status: 500 }
    )
  }
}
