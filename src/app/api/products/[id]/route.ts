import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Валидация данных товара
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  sku: z.string().min(1, 'Артикул обязателен'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  productType: z.enum(['STANDARD', 'ASSEMBLY', 'WAREHOUSE']).default('STANDARD'),
  type: z.enum(['PRODUCT', 'SERVICE']).default('PRODUCT'),
  
  basePrice: z.number().min(0, 'Базовая цена не может быть отрицательной').default(0),
  materialCost: z.number().min(0, 'Стоимость материалов не может быть отрицательной').default(0),
  laborCost: z.number().min(0, 'Стоимость работ не может быть отрицательной').default(0),
  overheadCost: z.number().min(0, 'Накладные расходы не могут быть отрицательными').default(0),
  totalCost: z.number().min(0, 'Общая стоимость не может быть отрицательной').default(0),
  
  sellingPrice: z.number().min(0, 'Цена продажи не может быть отрицательной').default(0),
  margin: z.number().min(0, 'Маржа не может быть отрицательной').default(0),
  currency: z.string().default('RUB'),
  
  productionTime: z.number().min(0, 'Время производства не может быть отрицательным').default(0),
  
  currentStock: z.number().min(0, 'Текущий остаток не может быть отрицательным').default(0),
  minStock: z.number().min(0, 'Минимальный остаток не может быть отрицательным').default(0),
  maxStock: z.number().min(0, 'Максимальный остаток не может быть отрицательным').default(0),
  
  tags: z.string().optional(),
  specifications: z.string().optional(),
  images: z.string().optional(),
  isActive: z.boolean().default(true),
  groupId: z.string().optional().nullable(),
  subgroupId: z.string().optional().nullable(),
  
  // Компоненты для сборных товаров
  assemblyComponents: z.array(z.object({
    componentProductId: z.string(),
    quantity: z.number().min(0),
    unit: z.string(),
    cost: z.number().min(0),
    sequence: z.number().default(0)
  })).optional(),
})

// GET /api/products/[id] - получить товар по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        group: true,
        subgroup: true,
        materialUsages: {
          include: {
            materialItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        workTypeUsages: {
          include: {
            workType: {
              include: {
                department: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
        fundUsages: {
          include: {
            fund: true,
            category: true,
            item: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        assemblyComponents: {
          include: {
            componentProduct: true,
          },
          orderBy: { sequence: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении товара' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - обновить товар
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT request for product ID:', params.id);
    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    // Обрабатываем числовые поля и извлекаем assemblyComponents
    const { assemblyComponents, ...restBody } = body;
    
    const processedBody = {
      ...restBody,
      basePrice: Number(body.basePrice || 0),
      materialCost: Number(body.materialCost || 0),
      laborCost: Number(body.laborCost || 0),
      overheadCost: Number(body.overheadCost || 0),
      totalCost: Number(body.totalCost || 0),
      sellingPrice: Number(body.sellingPrice || 0),
      margin: Number(body.margin || 0),
      productionTime: Number(body.productionTime || 0),
      currentStock: Number(body.currentStock || 0),
      minStock: Number(body.minStock || 0),
      maxStock: Number(body.maxStock || 0),
      // Преобразуем пустые строки в null для groupId и subgroupId
      groupId: body.groupId === "" || body.groupId === undefined ? null : body.groupId,
      subgroupId: body.subgroupId === "" || body.subgroupId === undefined ? null : body.subgroupId,
    };
    
    const validatedData = productSchema.parse({
      ...processedBody,
      assemblyComponents
    })
    console.log('Validation passed:', validatedData);

    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Проверяем уникальность артикула (исключая текущий товар)
    const skuConflict = await prisma.product.findFirst({
      where: {
        sku: validatedData.sku,
        id: { not: params.id },
      },
    })

    if (skuConflict) {
      return NextResponse.json(
        { error: 'Товар с таким артикулом уже существует' },
        { status: 400 }
      )
    }

    // Извлекаем связанные данные
    const { assemblyComponents: components, ...productData } = validatedData;

    console.log('Updating with data:', JSON.stringify(productData, null, 2));

    // Обновляем товар в транзакции
    const product = await prisma.$transaction(async (tx) => {
      // Обновляем основные данные товара
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: productData,
      })

      // Обновляем сборные компоненты если товар сборный
      if (validatedData.productType === 'ASSEMBLY' && components) {
        // Удаляем существующие компоненты
        await tx.assemblyComponent.deleteMany({
          where: { parentProductId: params.id },
        })

        // Добавляем новые компоненты
        if (components.length > 0) {
          await tx.assemblyComponent.createMany({
            data: components.map((component, index) => ({
              parentProductId: params.id,
              componentProductId: component.componentProductId,
              quantity: component.quantity,
              unit: component.unit,
              cost: component.cost,
              sequence: component.sequence || index,
            })),
          })
        }
      }

      // Возвращаем обновленный товар с включенными связями
      return await tx.product.findUnique({
        where: { id: params.id },
        include: {
          group: true,
          subgroup: true,
          assemblyComponents: {
            include: {
              componentProduct: true,
            },
            orderBy: { sequence: 'asc' },
          },
        },
      })
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации данных', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - удалить товар (мягкое удаление)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем существование товара
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Мягкое удаление - деактивируем товар
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
      include: {
        group: true,
        subgroup: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    )
  }
}
