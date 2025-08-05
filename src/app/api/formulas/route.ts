import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const formulas = await prisma.savedFormula.findMany({
      where: { 
        isActive: true,
        isPublic: true 
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: formulas
    })
  } catch (error) {
    console.error('Error fetching formulas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении формул' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Валидация обязательных полей
    if (!data.name || !data.formula || !data.variables) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Отсутствуют обязательные поля: name, formula, variables' 
        },
        { status: 400 }
      )
    }

    const formula = await prisma.savedFormula.create({
      data: {
        name: data.name,
        description: data.description || null,
        formula: data.formula,
        variables: data.variables,
        category: data.category || null,
        isPublic: data.isPublic ?? true,
        createdBy: data.createdBy || null
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formula
    })
  } catch (error) {
    console.error('Error creating formula:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при создании формулы' 
      }, 
      { status: 500 }
    )
  }
}
