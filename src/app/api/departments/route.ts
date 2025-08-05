import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/departments - получить все отделы
export async function GET() {
  try {
    console.log('Fetching departments...')
    
    const departments = await prisma.department.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            workTypes: true,
            employees: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('Departments fetched:', departments.length)

    return NextResponse.json({
      data: departments,
      success: true
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось загрузить отделы',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/departments - создать новый отдел
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive = true } = body

    // Валидация
    if (!name) {
      return NextResponse.json({
        success: false,
        message: 'Название отдела обязательно'
      }, { status: 400 })
    }

    // Проверка уникальности названия
    const existingDepartment = await prisma.department.findFirst({
      where: { name }
    })

    if (existingDepartment) {
      return NextResponse.json({
        success: false,
        message: 'Отдел с таким названием уже существует'
      }, { status: 400 })
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        isActive
      }
    })

    return NextResponse.json({
      data: department,
      success: true,
      message: 'Отдел успешно создан'
    })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось создать отдел'
    }, { status: 500 })
  }
}
