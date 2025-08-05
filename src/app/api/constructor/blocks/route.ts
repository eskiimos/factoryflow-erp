import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/constructor/blocks - получить все блоки
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const category = url.searchParams.get('category')
    const active = url.searchParams.get('active')

    const where: any = {}
    
    if (type) where.type = type
    if (category) where.category = category
    if (active !== null) where.isActive = active === 'true'

    const blocks = await prisma.productBlock.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' }, // Системные блоки первыми
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Преобразуем JSON конфиг обратно в объект
    const blocksWithConfig = blocks.map(block => ({
      ...block,
      config: JSON.parse(block.config)
    }))

    return NextResponse.json({
      success: true,
      data: blocksWithConfig
    })

  } catch (error) {
    console.error('Ошибка при получении блоков:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Не удалось загрузить блоки конструктора' 
      },
      { status: 500 }
    )
  }
}

// POST /api/constructor/blocks - создать новый блок
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { name, description, type, category, icon, config } = data

    // Валидация обязательных полей
    if (!name || !type || !config) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Обязательные поля: name, type, config' 
        },
        { status: 400 }
      )
    }

    // Валидация типа блока
    const validTypes = ['MATERIALS', 'WORK_TYPES', 'OPTIONS', 'FORMULAS']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Неверный тип блока. Допустимые: ${validTypes.join(', ')}` 
        },
        { status: 400 }
      )
    }

    const block = await prisma.productBlock.create({
      data: {
        name,
        description,
        type,
        category,
        icon,
        config: JSON.stringify(config),
        isActive: true,
        isSystem: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...block,
        config: JSON.parse(block.config)
      }
    })

  } catch (error) {
    console.error('Ошибка при создании блока:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Не удалось создать блок' 
      },
      { status: 500 }
    )
  }
}
