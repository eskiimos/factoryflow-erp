import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Валидация данных для конвертации
const conversionSchema = z.object({
  value: z.number(),
  fromUnit: z.string().min(1, 'Исходная единица обязательна'),
  toUnit: z.string().min(1, 'Целевая единица обязательна')
})

// POST - конвертация между единицами измерения
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { value, fromUnit, toUnit } = conversionSchema.parse(body)

    // Если единицы одинаковые, возвращаем исходное значение
    if (fromUnit === toUnit) {
      return NextResponse.json({
        success: true,
        data: {
          originalValue: value,
          convertedValue: value,
          fromUnit,
          toUnit,
          formula: `${value} ${fromUnit} = ${value} ${toUnit}`
        }
      })
    }

    // Получаем единицы измерения из базы
    const [fromUnitData, toUnitData] = await Promise.all([
      prisma.measurementUnit.findFirst({
        where: { 
          OR: [
            { symbol: fromUnit },
            { name: fromUnit }
          ],
          isActive: true
        }
      }),
      prisma.measurementUnit.findFirst({
        where: { 
          OR: [
            { symbol: toUnit },
            { name: toUnit }
          ],
          isActive: true
        }
      })
    ])

    if (!fromUnitData || !toUnitData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Одна или обе единицы измерения не найдены' 
        },
        { status: 404 }
      )
    }

    // Проверяем совместимость типов
    if (fromUnitData.type !== toUnitData.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Нельзя конвертировать ${fromUnitData.type} в ${toUnitData.type}` 
        },
        { status: 400 }
      )
    }

    // Проверяем совместимость базовых единиц
    if (fromUnitData.baseUnit !== toUnitData.baseUnit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Несовместимые базовые единицы: ${fromUnitData.baseUnit} и ${toUnitData.baseUnit}` 
        },
        { status: 400 }
      )
    }

    // Выполняем конвертацию через базовую единицу
    // Сначала переводим в базовую единицу, затем в целевую
    const baseValue = value * fromUnitData.conversionFactor
    const convertedValue = baseValue / toUnitData.conversionFactor
    
    // Округляем до разумного количества знаков после запятой
    const roundedValue = Math.round(convertedValue * 1000000) / 1000000

    return NextResponse.json({
      success: true,
      data: {
        originalValue: value,
        convertedValue: roundedValue,
        fromUnit: fromUnitData.symbol,
        toUnit: toUnitData.symbol,
        formula: `${value} ${fromUnitData.symbol} = ${roundedValue} ${toUnitData.symbol}`,
        conversionFactor: toUnitData.conversionFactor / fromUnitData.conversionFactor,
        type: fromUnitData.type
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Некорректные данные для конвертации',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('Error converting units:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при конвертации единиц измерения' 
      },
      { status: 500 }
    )
  }
}
