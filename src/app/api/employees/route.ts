import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees - получить всех сотрудников
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId') || undefined
    const status = searchParams.get('status') || undefined
    const skillLevel = searchParams.get('skillLevel') || undefined
    
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        ...(departmentId && { departmentId }),
        ...(status && { status }),
        ...(skillLevel && { skillLevel })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: employees
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при получении сотрудников',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/employees - создать нового сотрудника
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      firstName,
      lastName,
      middleName,
      position,
      email,
      phone,
      salary,
      departmentId,
      isActive = true,
      hireDate,
      notes
    } = data

    // Validation
    if (!firstName || !lastName || !position) {
      return NextResponse.json({
        success: false,
        message: 'Обязательные поля: имя, фамилия, должность'
      }, { status: 400 })
    }

    // Генерируем уникальный табельный номер
    const employeeCount = await prisma.employee.count()
    const personnelNumber = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`

    const employee = await prisma.employee.create({
      data: {
        personnelNumber,
        firstName,
        lastName,
        middleName: middleName || null,
        position,
        skillLevel: 'Рабочий', // Значение по умолчанию
        hourlyRate: salary ? salary / 160 : 0, // Примерный расчет из месячной зарплаты
        currency: 'RUB',
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        phone: phone || null,
        email: email || null,
        departmentId: departmentId || null,
        status: 'ACTIVE',
        isActive
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Сотрудник успешно создан'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating employee:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при создании сотрудника',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
