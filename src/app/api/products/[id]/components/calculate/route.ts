import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Интерфейсы для расчета компонентов
interface ComponentCalculationParams {
  [key: string]: number | string
}

interface MaterialCalculation {
  materialId: string
  materialName: string
  quantity: number
  unit: string
  unitPrice: number
  totalCost: number
  wasteQuantity: number
  effectiveQuantity: number
}

interface ComponentCalculation {
  componentId: string
  componentName: string
  quantity: number
  materials: MaterialCalculation[]
  totalMaterialCost: number
}

interface ProductCalculationResult {
  productId: string
  productName: string
  totalQuantity: number
  components: ComponentCalculation[]
  totalCost: number
  totalMaterialQuantity: { [materialId: string]: number }
}

// Схема валидации для расчета
const CalculateComponentsSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive().default(1),
  parameters: z.record(z.union([z.string(), z.number()])).default({}),
})

// Функция для вычисления формул
function evaluateFormula(formula: string, params: ComponentCalculationParams): number {
  try {
    // Простая замена переменных в формуле
    let expression = formula
    
    // Заменяем переменные на их значения
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      expression = expression.replace(regex, String(value))
    }
    
    // Простая оценка математических выражений
    // В продакшене лучше использовать безопасный парсер
    const result = eval(expression)
    return typeof result === 'number' ? result : 0
  } catch (error) {
    console.error('Ошибка вычисления формулы:', formula, error)
    return 0
  }
}

// Функция расчета потребности материала для компонента
function calculateMaterialUsage(
  materialUsage: any,
  componentQuantity: number,
  componentParams: ComponentCalculationParams
): MaterialCalculation {
  // Базовая потребность из формулы
  const baseQuantity = evaluateFormula(materialUsage.usageFormula, componentParams)
  
  // Учитываем количество компонентов
  const quantity = baseQuantity * componentQuantity
  
  // Учитываем коэффициент отходов
  const wasteQuantity = quantity * (materialUsage.wasteFactor - 1)
  const effectiveQuantity = quantity * materialUsage.wasteFactor
  
  // Рассчитываем стоимость
  const unitPrice = materialUsage.materialItem.price
  const totalCost = effectiveQuantity * unitPrice
  
  return {
    materialId: materialUsage.materialItem.id,
    materialName: materialUsage.materialItem.name,
    quantity,
    unit: materialUsage.unit,
    unitPrice,
    totalCost,
    wasteQuantity,
    effectiveQuantity
  }
}

// POST /api/products/[id]/components/calculate - расчет компонентов продукта
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = CalculateComponentsSchema.parse({ ...body, productId: id })

    // Получаем продукт
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Продукт не найден' },
        { status: 404 }
      )
    }

    // Получаем компоненты продукта с их материалами
    const components = await prisma.productComponent.findMany({
      where: { 
        productId: validatedData.productId,
        isActive: true
      },
      include: {
        materialUsages: {
          include: {
            materialItem: {
              select: { 
                id: true, 
                name: true, 
                unit: true, 
                price: true,
                baseUnit: true,
                calculationUnit: true,
                conversionFactor: true
              }
            }
          }
        },
        workTypeUsages: {
          include: {
            workType: {
              select: { 
                id: true, 
                name: true, 
                unit: true, 
                hourlyRate: true
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Подготавливаем параметры для расчета
    const calculationParams: ComponentCalculationParams = {
      ...validatedData.parameters,
      totalQuantity: validatedData.quantity,
    }

    // Рассчитываем каждый компонент
    const componentCalculations: ComponentCalculation[] = []
    const totalMaterialQuantity: { [materialId: string]: number } = {}

    for (const component of components) {
      // Рассчитываем количество компонента
      let componentQuantity = component.baseQuantity
      
      if (component.quantityFormula) {
        componentQuantity = evaluateFormula(component.quantityFormula, calculationParams)
      }
      
      // Умножаем на общее количество продукта
      componentQuantity *= validatedData.quantity

      // Проверяем условие включения компонента
      let includeComponent = true
      if (component.includeCondition) {
        try {
          includeComponent = Boolean(evaluateFormula(component.includeCondition, calculationParams))
        } catch (error) {
          console.warn('Ошибка условия включения:', component.includeCondition, error)
        }
      }

      if (!includeComponent) {
        continue
      }

      // Рассчитываем материалы для компонента
      const materialCalculations: MaterialCalculation[] = []
      
      for (const materialUsage of component.materialUsages) {
        const materialCalc = calculateMaterialUsage(
          materialUsage,
          componentQuantity,
          {
            ...calculationParams,
            componentQuantity,
            width: component.width || 0,
            height: component.height || 0,
            depth: component.depth || 0,
            thickness: component.thickness || 0,
          }
        )
        
        materialCalculations.push(materialCalc)
        
        // Добавляем к общему количеству материалов
        if (!totalMaterialQuantity[materialCalc.materialId]) {
          totalMaterialQuantity[materialCalc.materialId] = 0
        }
        totalMaterialQuantity[materialCalc.materialId] += materialCalc.effectiveQuantity
      }

      // Суммируем стоимость материалов компонента
      const totalMaterialCost = materialCalculations.reduce(
        (sum, mat) => sum + mat.totalCost, 0
      )

      componentCalculations.push({
        componentId: component.id,
        componentName: component.name,
        quantity: componentQuantity,
        materials: materialCalculations,
        totalMaterialCost
      })
    }

    // Рассчитываем общую стоимость
    const totalCost = componentCalculations.reduce(
      (sum, comp) => sum + comp.totalMaterialCost, 0
    )

    const result: ProductCalculationResult = {
      productId: validatedData.productId,
      productName: product.name,
      totalQuantity: validatedData.quantity,
      components: componentCalculations,
      totalCost,
      totalMaterialQuantity
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error calculating components:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Не удалось выполнить расчет компонентов' },
      { status: 500 }
    )
  }
}
