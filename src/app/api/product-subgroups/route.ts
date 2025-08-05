import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ProductSubgroupSchema = z.object({
  name: z.string().min(1, 'Название подгруппы обязательно'),
  description: z.string().optional(),
  groupId: z.string().min(1, 'Группа обязательна'),
});

// GET /api/product-subgroups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const isActive = searchParams.get('isActive') !== 'false';
    
    const where: any = { isActive };
    if (groupId) {
      where.groupId = groupId;
    }
    
    const subgroups = await prisma.productSubgroup.findMany({
      where,
      include: {
        group: true,
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

// POST /api/product-subgroups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProductSubgroupSchema.parse(body);
    
    const subgroup = await prisma.productSubgroup.create({
      data: validatedData,
      include: {
        group: true
      }
    });

    return NextResponse.json({
      data: subgroup,
      success: true,
      message: 'Подгруппа товаров создана успешно',
    });
  } catch (error) {
    console.error('Error creating product subgroup:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка создания подгруппы товаров' },
      { status: 500 }
    );
  }
}
