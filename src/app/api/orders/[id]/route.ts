import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/orders/[id] - получить заказ по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id, isActive: true },
      include: {
        items: {
          include: {
            product: true,
            template: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Ошибка при получении заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - обновить заказ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: { id, isActive: true },
      include: { items: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Обновляем заказ
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        actualDeliveryDate: data.actualDeliveryDate ? new Date(data.actualDeliveryDate) : null,
        status: data.status,
        paymentStatus: data.paymentStatus,
        productionStatus: data.productionStatus,
        notes: data.notes,
        internalNotes: data.internalNotes,
        priority: data.priority,
        source: data.source,
        advancePayment: data.advancePayment,
        paymentMethod: data.paymentMethod
      },
      include: {
        items: {
          include: {
            product: true,
            template: true
          }
        }
      }
    })

    // Пересчитываем остаток к доплате
    const totalAmount = updatedOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const remainingPayment = totalAmount - (data.advancePayment || 0)

    const finalOrder = await prisma.order.update({
      where: { id },
      data: {
        totalAmount,
        remainingPayment,
        paymentStatus: (data.advancePayment || 0) >= totalAmount ? 'PAID' 
                     : (data.advancePayment || 0) > 0 ? 'PARTIAL' 
                     : 'PENDING'
      },
      include: {
        items: {
          include: {
            product: true,
            template: true
          }
        }
      }
    })

    return NextResponse.json({ order: finalOrder })

  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - мягкое удаление заказа
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id, isActive: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Мягкое удаление
    await prisma.order.update({
      where: { id },
      data: { 
        isActive: false,
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({ message: 'Заказ успешно отменен' })

  } catch (error) {
    console.error('Ошибка при удалении заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа' },
      { status: 500 }
    )
  }
}
