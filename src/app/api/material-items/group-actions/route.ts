import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Схема для групповых критериев
const GroupCriteriaSchema = z.object({
  type: z.enum(["category", "unit", "currency", "priceRange", "status", "all"]),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  currency: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isActive: z.boolean().optional()
})

// Схемы для групповых действий
const GroupActionSchema = z.object({
  action: z.enum([
    "update_prices_percent",
    "update_prices_currency", 
    "copy_materials",
    "delete_materials",
    "update_category",
    "estimate_count" // Добавляем действие для оценки количества
  ]),
  groupCriteria: GroupCriteriaSchema,
  params: z.any() // Параметры зависят от конкретного действия
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Group action request:", body)
    
    const validatedData = GroupActionSchema.parse(body)
    
    // Получаем материалы по критериям группы
    const targetItemIds = await getMaterialsByGroupCriteria(validatedData.groupCriteria)
    
    // Специальная обработка для действия оценки количества
    if (validatedData.action === "estimate_count") {
      return NextResponse.json({
        success: true,
        estimatedCount: targetItemIds.length,
        message: `Найдено ${targetItemIds.length} материалов для обработки`
      })
    }
    
    if (targetItemIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Не найдено материалов для обработки по указанным критериям" },
        { status: 400 }
      )
    }

    let result: any = {}
    
    switch (validatedData.action) {
      case "update_prices_percent":
        result = await updatePricesPercent(targetItemIds, validatedData.params)
        break
      
      case "update_prices_currency":
        result = await updatePricesCurrency(targetItemIds, validatedData.params)
        break
      
      case "copy_materials":
        result = await copyMaterials(targetItemIds, validatedData.params)
        break
      
      case "delete_materials":
        result = await deleteMaterials(targetItemIds, validatedData.params)
        break
      
      case "update_category":
        result = await updateCategory(targetItemIds, validatedData.params)
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
      affected: result.affected,
      groupCriteria: validatedData.groupCriteria
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Ошибка валидации", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Ошибка групповых действий:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка выполнения групповых действий" },
      { status: 500 }
    )
  }
}

// Функция для получения материалов по групповым критериям
async function getMaterialsByGroupCriteria(criteria: any): Promise<string[]> {
  let where: any = { isActive: true }

  switch (criteria.type) {
    case "category":
      if (criteria.categoryId) {
        where.categoryId = criteria.categoryId
      }
      break
    
    case "unit":
      if (criteria.unit) {
        where.unit = {
          equals: criteria.unit,
          mode: "insensitive"
        }
      }
      break
    
    case "currency":
      if (criteria.currency) {
        where.currency = criteria.currency
      }
      break
    
    case "priceRange":
      where.price = {}
      if (criteria.minPrice !== undefined) {
        where.price.gte = criteria.minPrice
      }
      if (criteria.maxPrice !== undefined) {
        where.price.lte = criteria.maxPrice
      }
      break
    
    case "status":
      if (criteria.isActive !== undefined) {
        where.isActive = criteria.isActive
      }
      break
    
    case "all":
      // Без дополнительных условий, только isActive: true
      break
    
    default:
      throw new Error("Неизвестный тип критерия группы")
  }

  const materials = await prisma.materialItem.findMany({
    where,
    select: { id: true }
  })

  return materials.map(m => m.id)
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
