import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/work-types/[id] - получить вид работы по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workType = await prisma.workType.findUnique({
      where: { id: params.id },
      include: {
        department: {
          include: {
            employees: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!workType) {
      return NextResponse.json({
        success: false,
        message: 'Вид работы не найден'
      }, { status: 404 })
    }

    return NextResponse.json({
      data: workType,
      success: true
    })
  } catch (error) {
    console.error('Error fetching work type:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось загрузить вид работы'
    }, { status: 500 })
  }
}

// PUT /api/work-types/[id] - обновить вид работы
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      unit,
      standardTime,
      hourlyRate,
      currency,
      skillLevel,
      equipmentRequired,
      safetyRequirements,
      departmentId,
      isActive
    } = body

    // Валидация обязательных полей
    if (!name) {
      return NextResponse.json({
        success: false,
        message: 'Название работы обязательно'
      }, { status: 400 })
    }

    if (!unit) {
      return NextResponse.json({
        success: false,
        message: 'Единица измерения обязательна'
      }, { status: 400 })
    }

    if (!standardTime || standardTime <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Нормативное время должно быть больше 0'
      }, { status: 400 })
    }

    if (!hourlyRate || hourlyRate <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Тарифная ставка должна быть больше 0'
      }, { status: 400 })
    }

    if (!skillLevel) {
      return NextResponse.json({
        success: false,
        message: 'Уровень квалификации обязателен'
      }, { status: 400 })
    }

    // Проверка существования
    const existingWorkType = await prisma.workType.findUnique({
      where: { id: params.id }
    })

    if (!existingWorkType) {
      return NextResponse.json({
        success: false,
        message: 'Вид работы не найден'
      }, { status: 404 })
    }

    const workType = await prisma.workType.update({
      where: { id: params.id },
      data: {
        name,
        description,
        unit,
        standardTime: parseFloat(standardTime),
        hourlyRate: parseFloat(hourlyRate),
        currency,
        skillLevel,
        equipmentRequired,
        safetyRequirements,
        departmentId: departmentId && departmentId.trim() !== '' ? departmentId : null,
        isActive
      },
      include: {
        department: true
      }
    })

    return NextResponse.json({
      data: workType,
      success: true,
      message: 'Вид работы успешно обновлен'
    })
  } catch (error) {
    console.error('Error updating work type:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось обновить вид работы'
    }, { status: 500 })
  }
}

// DELETE /api/work-types/[id] - удалить вид работы (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка существования
    const existingWorkType = await prisma.workType.findUnique({
      where: { id: params.id }
    })

    if (!existingWorkType) {
      return NextResponse.json({
        success: false,
        message: 'Вид работы не найден'
      }, { status: 404 })
    }

    // Мягкое удаление
    await prisma.workType.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Вид работы успешно удален'
    })
  } catch (error) {
    console.error('Error deleting work type:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось удалить вид работы'
    }, { status: 500 })
  }
}
