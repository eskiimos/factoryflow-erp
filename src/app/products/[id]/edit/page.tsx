import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/product-form'
import { prisma } from '@/lib/prisma'

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  console.log(`Getting product directly from database: ${id}`)
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        group: true,
        subgroup: true,
        materialUsages: {
          include: {
            materialItem: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        workTypeUsages: {
          include: {
            workType: {
              include: {
                department: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
        fundUsages: {
          include: {
            fund: true,
            category: true,
            item: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!product) {
      console.log(`Product not found: ${id}`)
      notFound()
    }

    console.log(`Product found: ${product.name}`)
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  return (
    <div className="container mx-auto p-6">
      <ProductForm mode="edit" product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductEditPageProps) {
  const { id } = await params
  
  try {
    const product = await getProduct(id)
    return {
      title: `Редактирование товара: ${product.name}`,
      description: product.description || `Редактирование товара ${product.name}`,
    }
  } catch (error) {
    return {
      title: 'Товар не найден',
      description: 'Запрашиваемый товар не найден',
    }
  }
}
