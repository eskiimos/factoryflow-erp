import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/orders/[id]/items - добавить позицию в заказ
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { id: orderId } = await params
    const data = await request.json()

    // Проверяем существование заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId, isActive: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Создаем позицию заказа
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        itemName: data.itemName,
        itemDescription: data.itemDescription,
        quantity: data.quantity || 1,
        unit: data.unit || 'шт',
        unitPrice: data.unitPrice || 0,
        totalPrice: (data.quantity || 1) * (data.unitPrice || 0),
        productId: data.productId,
        templateId: data.templateId,
        calculationId: data.calculationId,
        calculationParameters: data.calculationParameters ? JSON.stringify(data.calculationParameters) : null,
        estimatedProductionTime: data.estimatedProductionTime || 0,
        productionNotes: data.productionNotes
      },
      include: {
        product: true,
        template: true
      }
    })

    // Обновляем общую сумму заказа
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    })
    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const remainingPayment = totalAmount - order.advancePayment

    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount,
        remainingPayment,
        paymentStatus: order.advancePayment >= totalAmount ? 'PAID' 
                     : order.advancePayment > 0 ? 'PARTIAL' 
                     : 'PENDING'
      }
    })

    return NextResponse.json({ orderItem })

  } catch (error) {
    console.error('Ошибка при добавлении позиции в заказ:', error)
    return NextResponse.json(
      { error: 'Ошибка при добавлении позиции в заказ' },
      { status: 500 }
    )
  }
}
