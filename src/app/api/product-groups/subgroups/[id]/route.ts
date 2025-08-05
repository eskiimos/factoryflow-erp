import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ProductSubgroupUpdateSchema = z.object({
  name: z.string().min(1, 'Название подгруппы обязательно').optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/product-groups/subgroups/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subgroup = await prisma.productSubgroup.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!subgroup) {
      return NextResponse.json({ success: false, message: 'Подгруппа не найдена' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subgroup });
  } catch (error) {
    console.error('Error fetching product subgroup:', error);
    return NextResponse.json({ success: false, message: 'Ошибка получения подгруппы' }, { status: 500 });
  }
}

// PUT /api/product-groups/subgroups/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validatedData = ProductSubgroupUpdateSchema.parse(body);

    // Получим текущую подгруппу
    const currentSubgroup = await prisma.productSubgroup.findUnique({
      where: { id: params.id },
      include: { parent: true }
    });

    if (!currentSubgroup) {
      return NextResponse.json({ success: false, message: 'Подгруппа не найдена' }, { status: 404 });
    }

    // Если изменяется родитель, проверим валидность
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId) {
        const newParent = await prisma.productSubgroup.findUnique({
          where: { id: validatedData.parentId },
          include: { parent: true }
        });
        
        if (!newParent) {
          return NextResponse.json(
            { success: false, message: 'Родительская подгруппа не найдена' },
            { status: 400 }
          );
        }
        
        if (newParent.groupId !== currentSubgroup.groupId) {
          return NextResponse.json(
            { success: false, message: 'Родительская подгруппа должна принадлежать той же группе' },
            { status: 400 }
          );
        }
        
        // Проверим, что мы не создаем третий уровень вложенности
        if (newParent.parentId) {
          return NextResponse.json(
            { success: false, message: 'Максимальная глубина вложенности - 2 уровня' },
            { status: 400 }
          );
        }
        
        // Проверим, что мы не создаем циклическую зависимость
        if (newParent.id === params.id) {
          return NextResponse.json(
            { success: false, message: 'Подгруппа не может быть родителем самой себя' },
            { status: 400 }
          );
        }
      }
    }

    const updatedSubgroup = await prisma.productSubgroup.update({
      where: { id: params.id },
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
      data: updatedSubgroup,
      success: true,
      message: 'Подгруппа товаров обновлена успешно',
    });
  } catch (error) {
    console.error('Error updating product subgroup:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Ошибка валидации', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Ошибка обновления подгруппы' }, { status: 500 });
  }
}

// DELETE /api/product-groups/subgroups/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Проверим, существует ли подгруппа
    const subgroup = await prisma.productSubgroup.findUnique({
      where: { id },
    });

    if (!subgroup) {
      return NextResponse.json(
        { success: false, message: 'Подгруппа не найдена' },
        { status: 404 }
      );
    }

    if (!subgroup.isActive) {
      return NextResponse.json(
        { success: false, message: 'Подгруппа уже удалена' },
        { status: 400 }
      );
    }

    // Проверим, есть ли товары в подгруппе
    const productsCount = await prisma.product.count({
      where: { subgroupId: params.id, isActive: true },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { success: false, message: `Нельзя удалить подгруппу, так как в ней ${productsCount} товаров. Сначала переместите или удалите товары.` },
        { status: 400 }
      );
    }

    // Проверим, есть ли дочерние подгруппы
    const childrenCount = await prisma.productSubgroup.count({
      where: { parentId: params.id, isActive: true },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { success: false, message: `Нельзя удалить подгруппу, так как у неё есть ${childrenCount} дочерних подгрупп. Сначала переместите или удалите их.` },
        { status: 400 }
      );
    }

    // Мягкое удаление
    await prisma.productSubgroup.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Подгруппа товаров успешно деактивирована (мягкое удаление)',
    });
  } catch (error) {
    console.error('Error deleting product subgroup:', error);
    return NextResponse.json({ success: false, message: 'Ошибка удаления подгруппы' }, { status: 500 });
  }
}
