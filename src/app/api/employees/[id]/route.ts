import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employees/[id] - получить сотрудника по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const employee = await prisma.employee.findUnique({
      where: {
        id: id
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

    if (!employee) {
      return NextResponse.json({
        success: false,
        message: 'Сотрудник не найден'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: employee
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при получении сотрудника',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/employees/[id] - обновить сотрудника
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
      isActive,
      hireDate
    } = data

    // Validation
    if (!firstName || !lastName || !position) {
      return NextResponse.json({
        success: false,
        message: 'Обязательные поля: имя, фамилия, должность'
      }, { status: 400 })
    }

    // Проверка существования сотрудника
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existingEmployee) {
      return NextResponse.json({
        success: false,
        message: 'Сотрудник не найден'
      }, { status: 404 })
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id
      },
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        position,
        hourlyRate: salary ? salary / 160 : existingEmployee.hourlyRate,
        hireDate: hireDate ? new Date(hireDate) : existingEmployee.hireDate,
        phone: phone || null,
        email: email || null,
        departmentId: departmentId || null,
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
      data: updatedEmployee,
      message: 'Сотрудник успешно обновлен'
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при обновлении сотрудника',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - удалить сотрудника (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Проверка существования сотрудника
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existingEmployee) {
      return NextResponse.json({
        success: false,
        message: 'Сотрудник не найден'
      }, { status: 404 })
    }

    // Мягкое удаление - устанавливаем isActive: false
    const deletedEmployee = await prisma.employee.update({
      where: {
        id
      },
      data: {
        isActive: false,
        status: 'DISMISSED'
      }
    })

    return NextResponse.json({
      success: true,
      data: deletedEmployee,
      message: 'Сотрудник успешно удален'
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при удалении сотрудника',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
