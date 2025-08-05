import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/calculator/configurations
export async function GET() {
  try {
    const configurations = await prisma.productConfiguration.findMany({
      include: {
        product: true,
        materials: {
          include: {
            material: true
          }
        },
        workTypes: {
          include: {
            workType: true
          }
        },
        funds: {
          include: {
            fund: true
          }
        }
      }
    })

    return NextResponse.json(configurations)
  } catch (error) {
    console.error('Error fetching configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }
}

// POST /api/calculator/configurations
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const configuration = await prisma.productConfiguration.create({
      data: {
        name: data.name,
        productId: data.productId,
        totalPrice: data.totalPrice,
        materials: {
          create: data.materials.map((m: any) => ({
            materialId: m.id,
            quantity: m.quantity,
            price: m.price
          }))
        },
        workTypes: {
          create: data.workTypes.map((w: any) => ({
            workTypeId: w.id,
            quantity: w.quantity,
            price: w.price
          }))
        },
        funds: {
          create: data.funds.map((f: any) => ({
            fundId: f.id,
            percentage: f.percentage
          }))
        }
      },
      include: {
        product: true,
        materials: {
          include: {
            material: true
          }
        },
        workTypes: {
          include: {
            workType: true
          }
        },
        funds: {
          include: {
            fund: true
          }
        }
      }
    })

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error saving configuration:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
