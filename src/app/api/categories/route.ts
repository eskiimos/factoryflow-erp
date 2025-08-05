import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const CategorySchema = z.object({
  name: z.string().min(1, "Название группы обязательно"),
  description: z.string().optional(),
})

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive") !== "false"
    
    const categories = await prisma.category.findMany({
      where: { isActive },
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

    return NextResponse.json({
      data: categories,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка получения групп" },
      { status: 500 }
    )
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CategorySchema.parse(body)
    
    const category = await prisma.category.create({
      data: validatedData,
    })

    return NextResponse.json({
      data: category,
      success: true,
      message: "Группа успешно создана",
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Ошибка валидации", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating category:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка создания группы" },
      { status: 500 }
    )
  }
}
