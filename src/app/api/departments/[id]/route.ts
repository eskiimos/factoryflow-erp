import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/departments/[id] - получить отдел по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        workTypes: true,
        employees: true,
        _count: {
          select: {
            workTypes: true,
            employees: true
          }
        }
      }
    })

    if (!department) {
      return NextResponse.json({
        success: false,
        message: 'Отдел не найден'
      }, { status: 404 })
    }

    return NextResponse.json({
      data: department,
      success: true
    })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось загрузить отдел'
    }, { status: 500 })
  }
}

// PUT /api/departments/[id] - обновить отдел
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, isActive } = body

    // Валидация
    if (!name) {
      return NextResponse.json({
        success: false,
        message: 'Название отдела обязательно'
      }, { status: 400 })
    }

    // Проверка существования
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id }
    })

    if (!existingDepartment) {
      return NextResponse.json({
        success: false,
        message: 'Отдел не найден'
      }, { status: 404 })
    }

    // Проверка уникальности названия (исключая текущий отдел)
    const duplicateDepartment = await prisma.department.findFirst({
      where: { 
        name,
        id: { not: params.id }
      }
    })

    if (duplicateDepartment) {
      return NextResponse.json({
        success: false,
        message: 'Отдел с таким названием уже существует'
      }, { status: 400 })
    }

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name,
        description,
        isActive
      }
    })

    return NextResponse.json({
      data: department,
      success: true,
      message: 'Отдел успешно обновлен'
    })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось обновить отдел'
    }, { status: 500 })
  }
}

// DELETE /api/departments/[id] - удалить отдел (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка существования
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            workTypes: true,
            employees: true
          }
        }
      }
    })

    if (!existingDepartment) {
      return NextResponse.json({
        success: false,
        message: 'Отдел не найден'
      }, { status: 404 })
    }

    // Проверка связанных данных
    if (existingDepartment._count.workTypes > 0 || existingDepartment._count.employees > 0) {
      return NextResponse.json({
        success: false,
        message: 'Нельзя удалить отдел, в котором есть виды работ или сотрудники'
      }, { status: 400 })
    }

    // Мягкое удаление
    await prisma.department.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Отдел успешно удален'
    })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось удалить отдел'
    }, { status: 500 })
  }
}
