import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/calculator/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        defaultMaterials: {
          include: {
            material: true
          }
        },
        defaultWorkTypes: {
          include: {
            workType: true
          }
        },
        defaultFunds: {
          include: {
            fund: true
          }
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
