import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Динамическое кэширование для API
export const dynamic = 'force-dynamic'
// Устанавливаем revalidate для кэша страниц
export const revalidate = 30 // кэш на 30 секунд

// Валидация данных товара
const materialUsageSchema = z.object({
  materialId: z.string(),
  quantity: z.number().min(0),
  unitType: z.string().optional(),
  baseQuantity: z.number().optional(),
  calculationFormula: z.string().optional()
})

const workTypeUsageSchema = z.object({
  workTypeId: z.string(),
  quantity: z.number().min(0),
  sequence: z.number(),
  unitType: z.string().optional(),
  baseTime: z.number().optional(),
  calculationFormula: z.string().optional()
})

const fundUsageSchema = z.object({
  fundId: z.string(),
  categoryId: z.string(),
  itemId: z.string().optional(),
  allocatedAmount: z.number().min(0),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional()
})

const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  sku: z.string().min(1, 'Артикул обязателен'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  productType: z.enum(['STANDARD', 'ASSEMBLY', 'WAREHOUSE']).default('STANDARD'),
  
  basePrice: z.number().min(0, 'Базовая цена не может быть отрицательной').default(0),
  materialCost: z.number().min(0, 'Стоимость материалов не может быть отрицательной').default(0),
  laborCost: z.number().min(0, 'Стоимость работ не может быть отрицательной').default(0),
  overheadCost: z.number().min(0, 'Накладные расходы не могут быть отрицательными').default(0),
  totalCost: z.number().min(0, 'Общая стоимость не может быть отрицательной').default(0),
  
  materials: z.array(materialUsageSchema).optional(),
  workTypes: z.array(workTypeUsageSchema).optional(),
  funds: z.array(fundUsageSchema).optional(),
  
  // Компоненты для сборных товаров
  assemblyComponents: z.array(z.object({
    componentProductId: z.string(),
    quantity: z.number().min(0),
    unit: z.string(),
    cost: z.number().min(0),
    sequence: z.number().default(0)
  })).optional(),
  
  sellingPrice: z.number().min(0, 'Цена продажи не может быть отрицательной'),
  margin: z.number().min(0, 'Маржа не может быть отрицательной'),
  currency: z.string().default('RUB'),
  
  productionTime: z.number().min(0, 'Время производства не может быть отрицательным'),
  
  currentStock: z.number().min(0, 'Текущий остаток не может быть отрицательным'),
  minStock: z.number().min(0, 'Минимальный остаток не может быть отрицательным'),
  maxStock: z.number().min(0, 'Максимальный остаток не может быть отрицательным'),
  
  tags: z.string().optional(),
  specifications: z.string().optional(),
  images: z.string().optional(),
  isActive: z.boolean().default(true),
  groupId: z.string().optional().nullable(),
  subgroupId: z.string().optional().nullable(),
})

// GET /api/products - получить список товаров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const groupId = searchParams.get('groupId') || ''
    const group = searchParams.get('group') || '' // Фильтрация по имени группы
    const showAll = searchParams.get('showAll') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const includeParameters = searchParams.get('includeParameters') === 'true'

    const skip = (page - 1) * limit

    // Построение условий фильтрации
    const whereConditions: any = {}

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      whereConditions.categoryId = categoryId
    }

    if (groupId) {
      whereConditions.groupId = groupId
    }

    if (group) {
      whereConditions.group = {
        name: group
      }
    }

    if (!includeInactive) {
      whereConditions.isActive = true
    }

    // Если запрашиваются все товары без пагинации, возвращаем простой массив
    if (showAll || !searchParams.get('page')) {
      // Для списка товаров загружаем только базовую информацию без тяжелых связей
      const includeObj: any = {
        group: {
          select: {
            id: true,
            name: true
          }
        },
        subgroup: {
          select: {
            id: true,
            name: true
          }
        }
      }

      // Детальные данные загружаем только если это явно запрошено
      if (includeParameters) {
        includeObj.materialUsages = {
          include: {
            materialItem: true,
          },
        }
        includeObj.workTypeUsages = {
          include: {
            workType: true,
          },
        }
        includeObj.fundUsages = {
          include: {
            fund: true,
            category: true,
            item: true,
          },
        }
        includeObj.parameters = {
          orderBy: { sortOrder: 'asc' }
        }
      }

      const products = await prisma.product.findMany({
        where: whereConditions,
        include: includeObj,
        orderBy: { createdAt: 'desc' },
      })
      
      return NextResponse.json({ data: products })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereConditions,
        include: {
          group: {
            select: {
              id: true,
              name: true
            }
          },
          subgroup: {
            select: {
              id: true,
              name: true
            }
          },
          // Детальные связи загружаем только при необходимости
          ...(includeParameters && {
            materialUsages: {
              include: {
                materialItem: true,
              },
            },
            workTypeUsages: {
              include: {
                workType: true,
              },
            },
            fundUsages: {
              include: {
                fund: true,
                category: true,
                item: true,
              },
            },
            parameters: {
              orderBy: { sortOrder: 'asc' }
            }
          }),
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
      }),
      prisma.product.count({ where: whereConditions }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    )
  }
}

// POST /api/products - создать новый товар
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Проверяем уникальность артикула
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Товар с таким артикулом уже существует' },
        { status: 400 }
      )
    }

    // Извлекаем связанные данные
    const { materials, workTypes, funds, assemblyComponents, ...productData } = validatedData

    // Создаем товар с компонентами в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Создаем основной товар
      const newProduct = await tx.product.create({
        data: productData,
      })

      // Обрабатываем компоненты в зависимости от типа товара
      if (validatedData.productType === 'ASSEMBLY' && assemblyComponents && assemblyComponents.length > 0) {
        // Создаем сборные компоненты
        await tx.assemblyComponent.createMany({
          data: assemblyComponents.map((component, index) => ({
            parentProductId: newProduct.id,
            componentProductId: component.componentProductId,
            quantity: component.quantity,
            unit: component.unit,
            cost: component.cost,
            sequence: component.sequence || index,
          })),
        })
      }

      if (validatedData.productType === 'STANDARD') {
        // Предварительно получаем данные для расчета стоимости
        const materialCosts = materials ? await Promise.all(
          materials.map(async (m) => {
            const material = await tx.materialItem.findUnique({
              where: { id: m.materialId }
            });
            if (!material) throw new Error(`Material with id ${m.materialId} not found`);
            return {
              ...m,
              cost: m.quantity * material.price
            };
          })
        ) : [];

        const workTypeCosts = workTypes ? await Promise.all(
          workTypes.map(async (w) => {
            const workType = await tx.workType.findUnique({
              where: { id: w.workTypeId }
            });
            if (!workType) throw new Error(`WorkType with id ${w.workTypeId} not found`);
            return {
              ...w,
              cost: w.quantity * workType.hourlyRate
            };
          })
        ) : [];

        // Создаем связанные данные для стандартного товара
        if (materialCosts.length > 0) {
          await tx.productMaterialUsage.createMany({
            data: materialCosts.map(m => ({
              productId: newProduct.id,
              materialItemId: m.materialId,
              quantity: m.quantity,
              cost: m.cost,
              unitType: m.unitType || 'fixed',
              baseQuantity: m.baseQuantity || 0,
              calculationFormula: m.calculationFormula
            }))
          })
        }

        if (workTypeCosts.length > 0) {
          await tx.productWorkTypeUsage.createMany({
            data: workTypeCosts.map(w => ({
              productId: newProduct.id,
              workTypeId: w.workTypeId,
              quantity: w.quantity,
              cost: w.cost,
              sequence: w.sequence || 0,
              unitType: w.unitType || 'fixed',
              baseTime: w.baseTime || 0,
              calculationFormula: w.calculationFormula
            }))
          })
        }

        if (funds && funds.length > 0) {
          await tx.productFundUsage.createMany({
            data: funds.filter(f => f.categoryId).map(f => ({
              productId: newProduct.id,
              fundId: f.fundId,
              categoryId: f.categoryId,
              itemId: f.itemId,
              allocatedAmount: f.allocatedAmount,
              percentage: f.percentage,
              description: f.description
            }))
          })
        }
      }

      // Возвращаем созданный товар со всеми связями
      return await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          group: true,
          subgroup: true,
          materialUsages: {
            include: {
              materialItem: true,
            },
          },
          workTypeUsages: {
            include: {
              workType: true,
            },
          },
          fundUsages: {
            include: {
              fund: true,
              category: true,
            },
          },
          assemblyComponents: {
            include: {
              componentProduct: true,
            },
            orderBy: { sequence: 'asc' },
          },
        },
      })
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    )
  }
}
