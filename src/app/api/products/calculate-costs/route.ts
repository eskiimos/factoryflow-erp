import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materials, workTypes, overhead } = body;

    // Получаем данные о материалах
    const materialIds = materials.map((m: { materialId: string }) => m.materialId);
    const materialItems = await prisma.materialItem.findMany({
      where: { id: { in: materialIds } }
    });

    // Считаем стоимость материалов
    const materialsCost = materials.reduce((sum: number, material: { materialId: string; quantity: number }) => {
      const materialData = materialItems.find(m => m.id === material.materialId);
      return sum + (materialData?.price || 0) * material.quantity;
    }, 0);

    // Получаем данные о видах работ
    const workTypeIds = workTypes.map((w: { workTypeId: string }) => w.workTypeId);
    const workTypeItems = await prisma.workType.findMany({
      where: { id: { in: workTypeIds } }
    });

    // Считаем стоимость работ
    const laborCost = workTypes.reduce((sum: number, workType: { workTypeId: string; quantity: number }) => {
      const workTypeData = workTypeItems.find(w => w.id === workType.workTypeId);
      if (workTypeData) {
        return sum + workTypeData.hourlyRate * workTypeData.standardTime * workType.quantity;
      }
      return sum;
    }, 0);

    // Считаем накладные расходы
    const overheadCost = (materialsCost + laborCost) * (overhead / 100);

    return NextResponse.json({
      materialsCost,
      laborCost,
      overheadCost,
      totalCost: materialsCost + laborCost + overheadCost
    });
  } catch (error) {
    console.error('Error calculating costs:', error);
    return NextResponse.json(
      { error: 'Failed to calculate costs' },
      { status: 500 }
    );
  }
}
