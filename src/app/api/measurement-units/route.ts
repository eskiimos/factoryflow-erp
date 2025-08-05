import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Валидация единицы измерения
const measurementUnitSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  symbol: z.string().min(1, 'Символ обязателен'),
  type: z.enum(['length', 'area', 'volume', 'weight', 'count'], {
    errorMap: () => ({ message: 'Недопустимый тип единицы измерения' })
  }),
  baseUnit: z.string().min(1, 'Базовая единица обязательна'),
  conversionFactor: z.number().min(0, 'Коэффициент должен быть положительным'),
  isActive: z.boolean().default(true)
})

// GET - получить все единицы измерения
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const groupBy = searchParams.get('groupBy')

    const where = {
      isActive: true,
      ...(type && { type })
    }

    const units = await prisma.measurementUnit.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { conversionFactor: 'desc' }
      ]
    })

    // Группировка по типам для удобства использования в UI
    if (groupBy === 'type') {
      const grouped = units.reduce((acc, unit) => {
        if (!acc[unit.type]) {
          acc[unit.type] = []
        }
        acc[unit.type].push(unit)
        return acc
      }, {} as Record<string, typeof units>)

      return NextResponse.json({
        success: true,
        data: grouped,
        meta: {
          total: units.length,
          types: Object.keys(grouped)
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: units,
      meta: {
        total: units.length
      }
    })

  } catch (error) {
    console.error('Error fetching measurement units:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении единиц измерения' 
      },
      { status: 500 }
    )
  }
}

// POST - создать новую единицу измерения
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = measurementUnitSchema.parse(body)

    // Проверяем уникальность названия и символа
    const existingUnit = await prisma.measurementUnit.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { symbol: validatedData.symbol }
        ]
      }
    })

    if (existingUnit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Единица измерения с таким названием или символом уже существует' 
        },
        { status: 400 }
      )
    }

    const unit = await prisma.measurementUnit.create({
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: unit,
      message: 'Единица измерения успешно создана'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Некорректные данные',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('Error creating measurement unit:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при создании единицы измерения' 
      },
      { status: 500 }
    )
  }
}
