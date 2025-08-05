import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = id
    const body = await request.json()
    const { images } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images array is required' },
        { status: 400 }
      )
    }

    // Обновляем изображения товара
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: JSON.stringify(images),
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        images: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
        updatedAt: updatedProduct.updatedAt
      }
    })

  } catch (error) {
    console.error('Update product images error:', error)
    return NextResponse.json(
      { error: 'Failed to update product images' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = id

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Получаем изображения товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        images: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        images: product.images ? JSON.parse(product.images) : []
      }
    })

  } catch (error) {
    console.error('Get product images error:', error)
    return NextResponse.json(
      { error: 'Failed to get product images' },
      { status: 500 }
    )
  }
}
