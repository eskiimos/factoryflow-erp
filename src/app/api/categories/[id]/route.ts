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
