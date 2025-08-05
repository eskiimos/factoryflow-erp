import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ProductSubgroupSchema = z.object({
  name: z.string().min(1, 'Название подгруппы обязательно'),
  description: z.string().optional(),
  groupId: z.string().min(1, 'ID группы обязателен'),
  parentId: z.string().optional(), // Для создания под-подгруппы
  isActive: z.boolean().default(true),
});

// GET /api/product-groups/subgroups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const parentId = searchParams.get('parentId');
    const isActive = searchParams.get('isActive') !== 'false';
    
    let whereClause: any = { isActive };
    
    if (groupId) {
      whereClause.groupId = groupId;
    }
    
    if (parentId) {
      whereClause.parentId = parentId;
    } else if (parentId === null) {
      whereClause.parentId = null;
    }
    
    const subgroups = await prisma.productSubgroup.findMany({
      where: whereClause,
      include: {
        group: true,
        parent: true,
        subgroups: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: { where: { isActive: true } }
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            products: { where: { isActive: true } }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      data: subgroups,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching product subgroups:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка получения подгрупп товаров' },
      { status: 500 }
    );
  }
}

// POST /api/product-groups/subgroups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProductSubgroupSchema.parse(body);
    
    // Проверим, что родительская подгруппа существует и принадлежит той же группе
    if (validatedData.parentId) {
      const parentSubgroup = await prisma.productSubgroup.findUnique({
        where: { id: validatedData.parentId },
        include: { parent: true }
      });
      
      if (!parentSubgroup) {
        return NextResponse.json(
          { success: false, message: 'Родительская подгруппа не найдена' },
          { status: 400 }
        );
      }
      
      if (parentSubgroup.groupId !== validatedData.groupId) {
        return NextResponse.json(
          { success: false, message: 'Родительская подгруппа должна принадлежать той же группе' },
          { status: 400 }
        );
      }
      
      // Проверим, что мы не создаем третий уровень вложенности
      if (parentSubgroup.parentId) {
        return NextResponse.json(
          { success: false, message: 'Максимальная глубина вложенности - 2 уровня' },
          { status: 400 }
        );
      }
    }

    const subgroup = await prisma.productSubgroup.create({
      data: validatedData,
      include: {
        group: true,
        parent: true,
        _count: {
          select: {
            products: { where: { isActive: true } }
          }
        }
      }
    });

    return NextResponse.json({
      data: subgroup,
      success: true,
      message: 'Подгруппа товаров создана успешно',
    });
  } catch (error) {
    console.error('Error creating product subgroup:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Ошибка валидации', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Ошибка создания подгруппы товаров' },
      { status: 500 }
    );
  }
}
