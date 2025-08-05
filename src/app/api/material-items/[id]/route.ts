import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const UpdateMaterialItemSchema = z.object({
  name: z.string().min(1, "Название обязательно").optional(),
  unit: z.string().min(1, "Единица измерения обязательна").optional(),
  price: z.number().min(0, "Цена должна быть положительной").optional(),
  currency: z.string().optional(),
  categoryId: z.string().nullable().optional().transform(val => val === '' ? null : val),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  
  // Управление запасами
  currentStock: z.number().min(0, "Остаток не может быть отрицательным").optional(),
  criticalMinimum: z.number().min(0, "Критический минимум не может быть отрицательным").optional(),
  satisfactoryLevel: z.number().min(0, "Удовлетворительный уровень не может быть отрицательным").optional(),
})

// GET /api/material-items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialItem = await prisma.materialItem.findUnique({
      where: { id: id },
      include: {
        category: true,
      },
    })

    if (!materialItem) {
      return NextResponse.json(
        { success: false, message: "Материал не найден" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: materialItem,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching material item:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка получения материала" },
      { status: 500 }
    )
  }
}

// PUT /api/material-items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const validatedData = UpdateMaterialItemSchema.parse(body)
    
    // Нормализуем данные для более эффективного поиска
    const normalizedData = {
      ...validatedData,
    }
    
    // Нормализуем только если поля присутствуют
    if (normalizedData.name) {
      normalizedData.name = normalizedData.name.trim();
    }
    
    if (normalizedData.unit) {
      normalizedData.unit = normalizedData.unit.trim().toLowerCase();
    }

    // Обрабатываем categoryId - если пустая строка, то ставим null
    if (normalizedData.categoryId !== undefined) {
      normalizedData.categoryId = normalizedData.categoryId && normalizedData.categoryId.trim() !== '' 
        ? normalizedData.categoryId 
        : null;
    }
    
    const materialItem = await prisma.materialItem.update({
      where: { id: id },
      data: {
        ...normalizedData,
        tags: validatedData.tags 
          ? JSON.stringify(validatedData.tags.map(tag => tag.toLowerCase())) 
          : undefined,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      data: materialItem,
      success: true,
      message: "Материал успешно обновлен",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Ошибка валидации", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error updating material item:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка обновления материала" },
      { status: 500 }
    )
  }
}

// DELETE /api/material-items/[id] (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialItem = await prisma.materialItem.update({
      where: { id: id },
      data: { isActive: false },
    })

    return NextResponse.json({
      data: materialItem,
      success: true,
      message: "Материал успешно удален",
    })
  } catch (error) {
    console.error("Error deleting material item:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка удаления материала" },
      { status: 500 }
    )
  }
}
