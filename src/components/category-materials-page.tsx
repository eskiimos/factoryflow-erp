"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Settings, Download, Upload } from "lucide-react"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MaterialsTable, MaterialsTableRef } from "@/components/materials-table"
import { MaterialForm } from "@/components/material-form"
import { CategoryBulkActionsButton } from "@/components/category-bulk-actions-button"
import { BulkActionDialog } from "@/components/bulk-action-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { Category } from "@/lib/types"

interface CategoryMaterialsPageProps {
  categoryId: string
}

export function CategoryMaterialsPage({ categoryId }: CategoryMaterialsPageProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const tableRef = useRef<MaterialsTableRef>(null)
  
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<any>()
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    isOpen: boolean;
    action: string;
  }>({ isOpen: false, action: '' })

  // Загрузка информации о категории
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`)
        const result = await response.json()
        
        if (result.success) {
          setCategory(result.data)
        } else {
          toast({
            variant: "error",
            title: "Ошибка",
            description: "Категория не найдена"
          })
          router.push('/materials')
        }
      } catch (error) {
        console.error('Error fetching category:', error)
        toast({
          variant: "error",
          title: "Ошибка",
          description: "Ошибка при загрузке категории"
        })
        router.push('/materials')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId, addToast, router])

  // Обработчики массовых действий для категории
  const handleBulkAction = (action: string) => {
    setBulkActionDialog({ isOpen: true, action })
  }

  const handleBulkActionSubmit = async (params: any) => {
    try {
      const response = await fetch('/api/material-items/group-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: convertActionToApi(bulkActionDialog.action),
          groupCriteria: {
            variant: 'category',
            categoryId: categoryId
          },
          params: params
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          variant: "success",
          title: "Успешно",
          description: result.message
        })
        
        // Обновляем таблицу
        if (tableRef.current) {
          tableRef.current.refreshData()
        }
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message
        })
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Произошла ошибка при выполнении действия"
      })
    }
  }

  const convertActionToApi = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'increase_price_percent': 'update_prices_percent',
      'decrease_price_percent': 'update_prices_percent',
      'copy_simple': 'copy_materials',
      'copy_to_category': 'copy_materials',
      'copy_with_changes': 'copy_materials',
      'change_category': 'update_category',
      'delete_soft': 'delete_materials',
      'update_currency_usd_rub': 'update_prices_currency',
      'update_currency_rub_usd': 'update_prices_currency'
    }
    return actionMap[action] || action
  }

  const refreshMaterials = () => {
    if (tableRef.current?.refreshData) {
      tableRef.current.refreshData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Загрузка категории...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Категория не найдена</p>
        <Button onClick={() => router.push('/materials')} className="mt-4">
          Вернуться к материалам
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/materials')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {category.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary">
                {category._count?.materialItems || 0} материалов
              </Badge>
              <Badge variant="outline">
                ID: {category.id}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          <Button
            onClick={() => {
              setEditingMaterial(undefined)
              setIsFormOpen(true)
            }}
          >
            <Package className="h-4 w-4 mr-2" />
            Добавить материал
          </Button>
        </div>
      </div>

      {/* Массовые действия для категории */}
      <CategoryBulkActionsButton
        categoryId={categoryId}
        categoryName={category.name}
        materialsCount={category._count?.materialItems || 0}
        onBulkAction={handleBulkAction}
      />

      {/* Materials Table */}
      <BentoGrid>
        <BentoCard size="2x2" className="col-span-full">
          <MaterialsTable 
            ref={tableRef}
            onEdit={(material) => {
              setEditingMaterial(material)
              setIsFormOpen(true)
            }}
            onRefreshNeeded={refreshMaterials}
            searchTerm=""
            searchFilters={[]}
            onSearchComplete={() => {}}
            selectedItems={[]}
            onSelectionChange={() => {}}
          />
        </BentoCard>
      </BentoGrid>

      {/* Material Form Dialog */}
      <MaterialForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        material={editingMaterial}
        title={editingMaterial ? "Редактировать материал" : "Добавить материал"}
        onSubmit={async (data) => {
          try {
            const url = editingMaterial 
              ? `/api/material-items/${editingMaterial.id}`
              : '/api/material-items'
            
            const method = editingMaterial ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })

            const result = await response.json()

            if (result.success) {
              toast({
                variant: "success",
                title: "Успешно",
                description: editingMaterial ? "Материал обновлен" : "Материал добавлен"
              })
              setIsFormOpen(false)
              refreshMaterials()
            } else {
              toast({
                variant: "error",
                title: "Ошибка",
                description: result.message || "Произошла ошибка"
              })
            }
          } catch (error) {
            console.error('Error saving material:', error)
            toast({
              variant: "error",
              title: "Ошибка",
              description: "Произошла ошибка при сохранении"
            })
          }
        }}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        isOpen={bulkActionDialog.isOpen}
        onClose={() => setBulkActionDialog({ isOpen: false, action: '' })}
        onSubmit={handleBulkActionSubmit}
        action={bulkActionDialog.action}
        selectedCount={category._count?.materialItems || 0}
        categories={[]} // Для действий с категориями
      />
    </div>
  )
}
