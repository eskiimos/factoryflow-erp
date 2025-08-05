import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/calculator/configurations/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const configuration = await prisma.productConfiguration.findUnique({
      where: { id },
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

    if (!configuration) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/calculator/configurations/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json()

    // Удаляем существующие связи
    await prisma.$transaction([
      prisma.configurationMaterial.deleteMany({
        where: { configurationId: id }
      }),
      prisma.configurationWorkType.deleteMany({
        where: { configurationId: id }
      }),
      prisma.configurationFund.deleteMany({
        where: { configurationId: id }
      })
    ])

    // Обновляем конфигурацию
    const configuration = await prisma.productConfiguration.update({
      where: { id },
      data: {
        name: data.name,
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
    console.error('Error updating configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/calculator/configurations/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.productConfiguration.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    )
  }
}
