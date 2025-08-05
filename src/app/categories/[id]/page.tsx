import { CategoryMaterialsPage } from "@/components/category-materials-page"

interface CategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  return <CategoryMaterialsPage categoryId={id} />
}

export async function generateMetadata({ params }: CategoryPageProps) {
  // Получаем информацию о категории для мета-тегов
  try {
    const { id } = await params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/categories/${id}`)
    const category = await response.json()
    
    return {
      title: `${category.name} - Материалы категории | FactoryFlow ERP`,
      description: `Управление материалами категории ${category.name}. ${category.description || ''}`,
    }
  } catch (error) {
    return {
      title: 'Категория материалов | FactoryFlow ERP',
      description: 'Управление материалами категории',
    }
  }
}
