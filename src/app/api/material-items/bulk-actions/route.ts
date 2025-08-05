import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Валидационные схемы для массовых действий
const BulkUpdatePricesSchema = z.object({
  action: z.literal("update_prices_percent"),
  itemIds: z.array(z.string()).optional(),
  groupCriteria: z.object({
    type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
    categoryId: z.string().optional(),
    unit: z.string().optional(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    isActive: z.boolean().optional()
  }).optional(),
  params: z.object({
    percent: z.number().min(-100).max(1000),
    operation: z.enum(["increase", "decrease"]),
    roundToInteger: z.boolean().optional()
  })
})

const BulkUpdateCurrencySchema = z.object({
  action: z.literal("update_prices_currency"),
  itemIds: z.array(z.string()).optional(),
  groupCriteria: z.object({
    type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
    categoryId: z.string().optional(),
    unit: z.string().optional(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    isActive: z.boolean().optional()
  }).optional(),
  params: z.object({
    fromCurrency: z.string(),
    toCurrency: z.string(),
    exchangeRate: z.number().positive(),
    spread: z.number().min(0).optional()
  })
})

const BulkCopyMaterialsSchema = z.object({
  action: z.literal("copy_materials"),
  itemIds: z.array(z.string()).optional(),
  groupCriteria: z.object({
    type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
    categoryId: z.string().optional(),
    unit: z.string().optional(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    isActive: z.boolean().optional()
  }).optional(),
  params: z.object({
    namePrefix: z.string().default("Копия"),
    categoryId: z.string().optional(),
    priceAdjustment: z.object({
      type: z.enum(["percent", "fixed"]),
      value: z.number()
    }).optional()
  })
})

const BulkDeleteSchema = z.object({
  action: z.literal("delete_materials"),
  itemIds: z.array(z.string()).optional(),
  groupCriteria: z.object({
    type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
    categoryId: z.string().optional(),
    unit: z.string().optional(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    isActive: z.boolean().optional()
  }).optional(),
  params: z.object({
    permanent: z.boolean().default(false)
  })
})

const BulkUpdateCategorySchema = z.object({
  action: z.literal("update_category"),
  itemIds: z.array(z.string()).optional(),
  groupCriteria: z.object({
    type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
    categoryId: z.string().optional(),
    unit: z.string().optional(),
    currency: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    isActive: z.boolean().optional()
  }).optional(),
  params: z.object({
    categoryId: z.string().nullable()
  })
})

const BulkActionSchema = z.discriminatedUnion("action", [
  BulkUpdatePricesSchema,
  BulkUpdateCurrencySchema,
  BulkCopyMaterialsSchema,
  BulkDeleteSchema,
  BulkUpdateCategorySchema
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = BulkActionSchema.parse(body)

    // Проверяем, что есть либо itemIds, либо groupCriteria
    if (!validatedData.itemIds && !validatedData.groupCriteria) {
      return NextResponse.json(
        { success: false, message: "Необходимо указать itemIds или groupCriteria" },
        { status: 400 }
      )
    }

    let result: any = {}
    
    switch (validatedData.action) {
      case "update_prices_percent":
        result = await updatePricesPercent(validatedData.itemIds || [], validatedData.params)
        break
      
      case "update_prices_currency":
        result = await updatePricesCurrency(validatedData.itemIds || [], validatedData.params)
        break
      
      case "copy_materials":
        result = await copyMaterials(validatedData.itemIds || [], validatedData.params)
        break
      
      case "delete_materials":
        result = await deleteMaterials(validatedData.itemIds || [], validatedData.params)
        break
      
      case "update_category":
        result = await updateCategory(validatedData.itemIds || [], validatedData.params)
        break
      
      default:
        return NextResponse.json(
          { success: false, message: "Неизвестное действие" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
      affected: result.affected
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Ошибка валидации", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Ошибка массовых действий:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка выполнения массовых действий" },
      { status: 500 }
    )
  }
}

// Функция обновления цен в процентах
async function updatePricesPercent(itemIds: string[], params: any) {
  const materials = await prisma.materialItem.findMany({
    where: { id: { in: itemIds }, isActive: true }
  })

  const updates = materials.map(material => {
    let newPrice = material.price
    
    if (params.operation === "increase") {
      newPrice = material.price * (1 + params.percent / 100)
    } else {
      newPrice = material.price * (1 - params.percent / 100)
    }
    
    if (params.roundToInteger) {
      newPrice = Math.round(newPrice)
    }
    
    return prisma.materialItem.update({
      where: { id: material.id },
      data: { price: newPrice }
    })
  })

  await Promise.all(updates)

  return {
    message: `Цены обновлены для ${materials.length} материалов`,
    affected: materials.length,
    data: materials.map(m => m.id)
  }
}

// Функция обновления цен по курсу валют
async function updatePricesCurrency(itemIds: string[], params: any) {
  const materials = await prisma.materialItem.findMany({
    where: { 
      id: { in: itemIds }, 
      isActive: true,
      currency: params.fromCurrency
    }
  })

  const spread = params.spread || 0
  const finalRate = params.exchangeRate * (1 + spread / 100)

  const updates = materials.map(material => {
    const newPrice = material.price * finalRate
    
    return prisma.materialItem.update({
      where: { id: material.id },
      data: { 
        price: Math.round(newPrice * 100) / 100,
        currency: params.toCurrency
      }
    })
  })

  await Promise.all(updates)

  return {
    message: `Валюта обновлена для ${materials.length} материалов`,
    affected: materials.length,
    data: materials.map(m => m.id)
  }
}

// Функция копирования материалов
async function copyMaterials(itemIds: string[], params: any) {
  const materials = await prisma.materialItem.findMany({
    where: { id: { in: itemIds }, isActive: true }
  })

  const copies = materials.map(material => {
    let newPrice = material.price
    
    if (params.priceAdjustment) {
      if (params.priceAdjustment.type === "percent") {
        newPrice = material.price * (1 + params.priceAdjustment.value / 100)
      } else {
        newPrice = material.price + params.priceAdjustment.value
      }
    }

    return prisma.materialItem.create({
      data: {
        name: `${params.namePrefix} ${material.name}`,
        unit: material.unit,
        price: Math.round(newPrice * 100) / 100,
        currency: material.currency,
        categoryId: params.categoryId || material.categoryId,
        tags: material.tags
      }
    })
  })

  const results = await Promise.all(copies)

  return {
    message: `Создано ${results.length} копий материалов`,
    affected: results.length,
    data: results.map(r => r.id)
  }
}

// Функция удаления материалов
async function deleteMaterials(itemIds: string[], params: any) {
  let affected = 0
  
  if (params.permanent) {
    const result = await prisma.materialItem.deleteMany({
      where: { id: { in: itemIds } }
    })
    affected = result.count
  } else {
    const result = await prisma.materialItem.updateMany({
      where: { id: { in: itemIds } },
      data: { isActive: false }
    })
    affected = result.count
  }

  return {
    message: `${params.permanent ? 'Удалено' : 'Деактивировано'} ${affected} материалов`,
    affected,
    data: itemIds
  }
}

// Функция обновления категории
async function updateCategory(itemIds: string[], params: any) {
  const result = await prisma.materialItem.updateMany({
    where: { id: { in: itemIds }, isActive: true },
    data: { categoryId: params.categoryId }
  })

  return {
    message: `Категория обновлена для ${result.count} материалов`,
    affected: result.count,
    data: itemIds
  }
}
