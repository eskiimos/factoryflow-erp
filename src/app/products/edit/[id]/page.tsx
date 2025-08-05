import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditProductPage } from '@/components/edit-product-page'

interface ProductEditPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        group: true,
        subgroup: true,
        materialUsages: {
          include: {
            materialItem: true
          }
        },
        workTypeUsages: {
          include: {
            workType: {
              include: {
                department: true
              }
            }
          }
        },
        fundUsages: {
          include: {
            fund: true,
            category: true,
            item: true
          }
        }
      }
    })

    if (!product) {
      redirect('/products')
    }

    return product
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error)
    redirect('/products')
  }
}

export default async function ProductEditPageRoute({ params }: ProductEditPageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  // Приводим типы к совместимости с ProductWithDetails
  const productForEdit = {
    ...product,
    description: product.description || undefined,
    tags: product.tags || undefined,
    specifications: product.specifications || undefined,
    images: product.images || undefined,
    variant: (product.type as 'PRODUCT' | 'SERVICE') || 'PRODUCT',
    groupId: product.groupId || undefined,
    subgroupId: product.subgroupId || undefined,
    group: product.group ? {
      id: product.group.id,
      name: product.group.name,
      description: product.group.description || undefined
    } : undefined,
    subgroup: product.subgroup ? {
      id: product.subgroup.id,
      name: product.subgroup.name,
      description: product.subgroup.description || undefined
    } : undefined,
    // Приводим массивы к нужному формату
    materialUsages: product.materialUsages.map(usage => ({
      ...usage,
      materialItem: {
        ...usage.materialItem,
        price: usage.materialItem.price || 0
      }
    })),
    workTypeUsages: product.workTypeUsages.map(usage => ({
      ...usage,
      workType: {
        ...usage.workType,
        description: usage.workType.description || undefined,
        department: usage.workType.department ? {
          id: usage.workType.department.id,
          name: usage.workType.department.name
        } : undefined
      }
    })),
    fundUsages: product.fundUsages || []
  } as any // Временно используем any для обхода строгой типизации

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    }>
      <EditProductPage product={productForEdit} />
    </Suspense>
  )
}

export const metadata = {
  title: 'Редактирование продукта - FactoryFlow ERP',
  description: 'Редактирование параметров продукта в системе FactoryFlow ERP'
}