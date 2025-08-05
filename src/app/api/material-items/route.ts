import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const MaterialItemSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  unit: z.string().min(1, "Единица измерения обязательна"),
  price: z.number().min(0, "Цена должна быть положительной"),
  currency: z.string().default("RUB"),
  categoryId: z.string().nullable().optional().transform(val => val === '' ? null : val),
  tags: z.array(z.string()).optional(),
  
  // Управление запасами
  currentStock: z.number().min(0, "Остаток не может быть отрицательным").default(0),
  criticalMinimum: z.number().min(0, "Критический минимум не может быть отрицательным").default(0),
  satisfactoryLevel: z.number().min(0, "Удовлетворительный уровень не может быть отрицательным").default(0),
})

const UpdateMaterialItemSchema = MaterialItemSchema.partial()

// GET /api/material-items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const unit = searchParams.get("unit") || ""
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice") || "0") : null
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice") || "0") : null
    const isActive = searchParams.get("isActive") !== "false"
    
    const skip = (page - 1) * limit
    
    // SQLite поиск с использованием фрагментов слов
    // Разбиваем поисковый запрос на отдельные слова для более гибкого поиска
    let searchTerms: string[] = [];
    
    if (search) {
      // Преобразуем запрос в нижний регистр и удаляем лишние пробелы
      const normalizedSearch = search.toLowerCase().trim();
      
      // Разбиваем на отдельные слова для поиска по частям
      searchTerms = normalizedSearch.split(/\s+/);
      
      // Добавляем оригинальную строку целиком для точного совпадения
      if (normalizedSearch.includes(' ')) {
        searchTerms.push(normalizedSearch);
      }
    }
    
    // Проверяем параметр showAll
    const showAll = searchParams.get("showAll") === "true";
    
    // Формируем условие поиска
    let where: any = {
      isActive,
    }
    
    // Добавляем поиск по текстовым полям, если есть поисковый запрос и его длина достаточная
    if (search && search.length >= 2) {
      // Ограничиваем количество поисковых терминов для производительности
      const limitedSearchTerms = searchTerms.slice(0, 3);
      
      // Ограничиваем количество поисковых условий для повышения производительности
      where.OR = [
        // Приоритетный поиск по имени (начинается с) - оригинальный термин
        ...limitedSearchTerms.map(term => ({
          name: {
            startsWith: term,
          }
        })),
        // Поиск по имени (содержит) - оригинальный термин
        ...limitedSearchTerms.map(term => ({
          name: {
            contains: term,
          }
        })),
        // Поиск по имени с заглавной буквы
        ...limitedSearchTerms.map(term => ({
          name: {
            contains: term.charAt(0).toUpperCase() + term.slice(1),
          }
        })),
        // Поиск по единице измерения (только если запрос короткий)
        ...(search.length <= 5 ? limitedSearchTerms.map(term => ({
          unit: {
            contains: term,
          }
        })) : []),
        // Поиск по тегам (только для явных тегов или коротких запросов)
        ...(search.startsWith('#') || search.length <= 5 ? limitedSearchTerms.map(term => ({
          tags: {
            contains: term,
          }
        })) : [])
      ];
    }
    
    // Фильтр по категории
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Фильтр по единице измерения
    if (unit) {
      where.unit = {
        equals: unit,
      };
    }
    
    // Фильтр по цене
    if (minPrice !== null || maxPrice !== null) {
      where.price = {};
      
      if (minPrice !== null) {
        where.price.gte = minPrice;
      }
      
      if (maxPrice !== null) {
        where.price.lte = maxPrice;
      }
    }
    
    // Логируем параметры поиска для отладки
    console.log("Search params:", { 
      search, 
      searchTerms, 
      categoryId,
      unit,
      minPrice,
      maxPrice,
      showAll
    });

    const [items, total] = await Promise.all([
      prisma.materialItem.findMany({
        where,
        include: {
          category: true, // Включаем категорию, даже если она null
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.materialItem.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      success: true,
    })
  } catch (error) {
    console.error("Error fetching material items:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка получения материалов" },
      { status: 500 }
    )
  }
}

// POST /api/material-items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MaterialItemSchema.parse(body)
    
    // Нормализуем данные для более эффективного поиска
    const normalizedData = {
      ...validatedData,
      // Сохраняем оригинальное название в базе, для нормализации можно
      // было бы использовать отдельное поле, но для простоты этого не делаем
      name: validatedData.name.trim(),
      unit: validatedData.unit.trim().toLowerCase(),
      // Убираем categoryId если он пустой
      categoryId: validatedData.categoryId && validatedData.categoryId.trim() !== '' ? validatedData.categoryId : null,
    }
    
    const materialItem = await prisma.materialItem.create({
      data: {
        ...normalizedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags.map(tag => tag.toLowerCase())) : null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      data: materialItem,
      success: true,
      message: "Материал успешно создан",
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Ошибка валидации", errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating material item:", error)
    return NextResponse.json(
      { success: false, message: "Ошибка создания материала" },
      { status: 500 }
    )
  }
}
