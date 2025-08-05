import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { templateGenerator } from '@/lib/template-generator'

// POST /api/constructor/generate-template - генерировать шаблон из блоков
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { blocks, metadata } = data

    // Валидация данных
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Необходимо выбрать хотя бы один блок' 
        },
        { status: 400 }
      )
    }

    if (!metadata?.name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Необходимо указать название шаблона' 
        },
        { status: 400 }
      )
    }

    console.log('🏗️ Генерация шаблона из блоков:', {
      blocksCount: blocks.length,
      metadata
    })

    // Получаем полную информацию о блоках из БД
    const blockIds = blocks.map((b: any) => b.blockId)
    const dbBlocks = await prisma.productBlock.findMany({
      where: {
        id: { in: blockIds },
        isActive: true
      }
    })

    if (dbBlocks.length !== blockIds.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Некоторые блоки не найдены или неактивны' 
        },
        { status: 400 }
      )
    }

    // Формируем структуру для генератора
    const selectedBlocks = blocks.map((blockData: any) => {
      const dbBlock = dbBlocks.find(db => db.id === blockData.blockId)!
      return {
        blockId: blockData.blockId,
        block: {
          ...dbBlock,
          config: JSON.parse(dbBlock.config)
        },
        position: blockData.position || 0,
        customConfig: blockData.customConfig,
        isEnabled: blockData.isEnabled !== false
      }
    })

    // Генерируем шаблон
    const result = await templateGenerator.generateFromBlocks(selectedBlocks, metadata)

    if (!result.validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ошибки валидации блоков',
          validation: result.validation
        },
        { status: 400 }
      )
    }

    // Сохраняем информацию о блочном шаблоне
    await prisma.productTemplateFromBlocks.create({
      data: {
        name: metadata.name,
        description: metadata.description,
        blocks: JSON.stringify(blocks),
        generatedTemplateId: result.templateId
      }
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ Ошибка генерации шаблона:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Не удалось сгенерировать шаблон' 
      },
      { status: 500 }
    )
  }
}
