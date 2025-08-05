import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materials, workTypes } = body;

    // Получаем ID материалов и видов работ
    const materialIds = materials.map((m: { materialId: string }) => m.materialId);
    const workTypeIds = workTypes.map((w: { workTypeId: string }) => w.workTypeId);

    // Ищем товары с похожими материалами или видами работ
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          {
            materialUsages: {
              some: {
                materialItemId: {
                  in: materialIds
                }
              }
            }
          },
          {
            workTypeUsages: {
              some: {
                workTypeId: {
                  in: workTypeIds
                }
              }
            }
          }
        ]
      },
      include: {
        materialUsages: {
          include: {
            materialItem: true
          }
        },
        workTypeUsages: {
          include: {
            workType: true
          }
        }
      },
      take: 5 // Ограничиваем количество похожих товаров
    });

    // Рассчитываем маржу для каждого товара
    const productsWithMargin = similarProducts.map(product => {
      const materialCost = product.materialUsages.reduce(
        (sum, usage) => sum + usage.quantity * usage.materialItem.price,
        0
      );

      const laborCost = product.workTypeUsages.reduce(
        (sum, usage) => sum + usage.quantity * usage.workType.hourlyRate * usage.workType.standardTime,
        0
      );

      const totalCost = materialCost + laborCost + (product.overheadCost || 0);
      const margin = totalCost > 0 ? ((product.sellingPrice - totalCost) / totalCost) * 100 : 0;

      return {
        name: product.name,
        price: product.sellingPrice,
        margin
      };
    });

    return NextResponse.json(productsWithMargin);
  } catch (error) {
    console.error('Error finding similar products:', error);
    return NextResponse.json(
      { error: 'Failed to find similar products' },
      { status: 500 }
    );
  }
}
