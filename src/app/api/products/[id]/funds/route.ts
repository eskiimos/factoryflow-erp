import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { 
      fundId, 
      categoryId, 
      itemId, 
      allocatedAmount, 
      percentage,
      description 
    } = body;

    // Проверяем существование продукта
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Проверяем существование фонда и категории
    const fund = await prisma.fund.findUnique({
      where: { id: fundId }
    });

    if (!fund) {
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      );
    }

    const category = await prisma.fundCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Fund category not found' },
        { status: 404 }
      );
    }

    // Рассчитываем финальную сумму
    let finalAmount = allocatedAmount || 0;
    if (percentage && percentage > 0) {
      finalAmount = (category.plannedAmount * percentage) / 100;
    }

    // Создаем связь продукта с фондом
    const fundUsage = await prisma.productFundUsage.create({
      data: {
        productId,
        fundId,
        categoryId,
        itemId: itemId || null,
        allocatedAmount: finalAmount,
        percentage: percentage || null,
        description: description || `Распределение из фонда "${fund.name}" категории "${category.name}"`
      },
      include: {
        fund: true,
        category: true,
        item: true
      }
    });

    // Обновляем стоимость продукта
    await updateProductCosts(productId);

    return NextResponse.json(fundUsage, { status: 201 });

  } catch (error) {
    console.error('Error adding fund to product:', error);
    return NextResponse.json(
      { error: 'Failed to add fund to product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const usageId = searchParams.get('usageId');

    if (!usageId) {
      return NextResponse.json(
        { error: 'Usage ID is required' },
        { status: 400 }
      );
    }

    // Проверяем существование связи
    const fundUsage = await prisma.productFundUsage.findUnique({
      where: { 
        id: usageId,
        productId: productId 
      }
    });

    if (!fundUsage) {
      return NextResponse.json(
        { error: 'Fund usage not found' },
        { status: 404 }
      );
    }

    // Удаляем связь
    await prisma.productFundUsage.delete({
      where: { id: usageId }
    });

    // Обновляем стоимость продукта
    await updateProductCosts(productId);

    return NextResponse.json(
      { message: 'Fund removed from product successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error removing fund from product:', error);
    return NextResponse.json(
      { error: 'Failed to remove fund from product' },
      { status: 500 }
    );
  }
}

async function updateProductCosts(productId: string) {
  try {
    // Получаем все использования фондов для продукта
    const fundUsages = await prisma.productFundUsage.findMany({
      where: { productId }
    });

    // Рассчитываем общую стоимость фондов
    const fundCost = fundUsages.reduce((total: number, usage: any) => {
      return total + (usage.allocatedAmount || 0);
    }, 0);

    // Получаем текущие данные продукта
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) return;

    // Обновляем накладные расходы и общую стоимость
    const newOverheadCost = (product.overheadCost || 0) + fundCost;
    const newTotalCost = (product.materialCost || 0) + (product.laborCost || 0) + newOverheadCost;
    
    let newMargin = null;
    if (product.sellingPrice && product.sellingPrice > 0) {
      newMargin = ((product.sellingPrice - newTotalCost) / product.sellingPrice) * 100;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        overheadCost: newOverheadCost,
        totalCost: newTotalCost,
        margin: newMargin || undefined,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating product costs:', error);
    throw error;
  }
}
