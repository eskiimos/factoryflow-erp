import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Кэширование для API групп
export const revalidate = 60 // кэш на 60 секунд

const ProductGroupSchema = z.object({
  name: z.string().min(1, 'Название группы обязательно'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/product-groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') !== 'false';
    const includeSubgroups = searchParams.get('includeSubgroups') !== 'false';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Условия для поиска
    const whereClause: any = { isActive };
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    const includeOptions: any = {
      _count: {
        select: {
          products: { where: { isActive: true } },
          subgroups: { where: { isActive: true } }
        }
      }
    };

    // Только загружаем подгруппы если это явно запрошено
    if (includeSubgroups) {
      const subgroupWhere: any = { 
        isActive: true,
        parentId: null // Только подгруппы первого уровня
      };
      
      // Если есть поиск, ищем также в подгруппах
      if (search) {
        subgroupWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { 
            parentGroup: { 
              name: { contains: search, mode: 'insensitive' } 
            } 
          }
        ];
      }

      includeOptions.subgroups = {
        where: subgroupWhere,
        include: {
          subgroups: {
            where: { 
              isActive: true,
              ...(search && {
                name: { contains: search, mode: 'insensitive' }
              })
            },
            include: {
              _count: {
                select: {
                  products: { where: { isActive: true } }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              products: { where: { isActive: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      };
    }
    
    const groups = await prisma.productGroup.findMany({
      where: whereClause,
      include: includeOptions,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
    });

    // Получаем общее количество для пагинации
    const totalCount = await prisma.productGroup.count({
      where: whereClause
    });

    return NextResponse.json({
      data: groups,
      success: true,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + groups.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching product groups:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка получения групп товаров' },
      { status: 500 }
    );
  }
}

// POST /api/product-groups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProductGroupSchema.parse(body);
    
    const group = await prisma.productGroup.create({
      data: validatedData,
    });

    return NextResponse.json({
      data: group,
      success: true,
      message: 'Группа товаров создана успешно',
    });
  } catch (error) {
    console.error('Error creating product group:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка создания группы товаров' },
      { status: 500 }
    );
  }
}
