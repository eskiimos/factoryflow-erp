import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formula = await prisma.savedFormula.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      }
    })
    
    if (!formula) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Формула не найдена' 
        }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: formula
    })
  } catch (error) {
    console.error('Error fetching formula:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении формулы' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const formula = await prisma.savedFormula.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        formula: data.formula,
        variables: data.variables,
        category: data.category,
        isPublic: data.isPublic,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formula
    })
  } catch (error) {
    console.error('Error updating formula:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обновлении формулы' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Мягкое удаление - просто помечаем как неактивную
    await prisma.savedFormula.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Формула успешно удалена'
    })
  } catch (error) {
    console.error('Error deleting formula:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при удалении формулы' 
      }, 
      { status: 500 }
    )
  }
}
