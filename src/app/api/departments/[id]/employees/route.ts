import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/departments/[id]/employees - получить сотрудников отдела
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employees = await prisma.employee.findMany({
      where: { 
        departmentId: params.id,
        isActive: true 
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    return NextResponse.json({
      data: employees,
      success: true
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось загрузить сотрудников'
    }, { status: 500 })
  }
}
