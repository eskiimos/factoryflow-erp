import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/work-types - получить все виды работ с фильтрацией и поиском
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const skillLevel = searchParams.get('skillLevel') || ''
    const minRate = searchParams.get('minRate') ? parseFloat(searchParams.get('minRate')!) : null
    const maxRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : null
    const showAll = searchParams.get('showAll') === 'true'

    console.log('Search params:', {
      search,
      departmentId,
      skillLevel,
      minRate,
      maxRate,
      showAll
    })

    // Строим условия фильтрации
    const where: any = {
      isActive: true
    }

    // Поиск по названию, описанию или оборудованию
    if (search && !showAll) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { equipmentRequired: { contains: search } }
      ]
    }

    // Фильтр по отделу
    if (departmentId) {
      where.departmentId = departmentId
    }

    // Фильтр по квалификации
    if (skillLevel) {
      where.skillLevel = skillLevel
    }

    // Фильтр по диапазону ставки
    if (minRate !== null || maxRate !== null) {
      where.hourlyRate = {}
      if (minRate !== null) where.hourlyRate.gte = minRate
      if (maxRate !== null) where.hourlyRate.lte = maxRate
    }

    // Получаем общее количество для пагинации
    const total = await prisma.workType.count({ where })

    // Получаем данные с пагинацией
    const workTypes = await prisma.workType.findMany({
      where,
      include: {
        department: {
          include: {
            employees: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { department: { name: 'asc' } },
        { name: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: workTypes,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      success: true
    })
  } catch (error) {
    console.error('Error fetching work types:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось загрузить виды работ'
    }, { status: 500 })
  }
}

// POST /api/work-types - создать новый вид работы
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      unit,
      standardTime,
      hourlyRate,
      currency = 'RUB',
      skillLevel,
      equipmentRequired,
      safetyRequirements,
      departmentId,
      isActive = true
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

    const workType = await prisma.workType.create({
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
      message: 'Вид работы успешно создан'
    })
  } catch (error) {
    console.error('Error creating work type:', error)
    return NextResponse.json({
      success: false,
      message: 'Не удалось создать вид работы'
    }, { status: 500 })
  }
}
