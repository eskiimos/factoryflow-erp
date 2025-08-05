"use client"

import React, { useState, useRef, useEffect } from "react"
import { 
  Plus,
  Download,
  Upload,
  Settings
} from "lucide-react"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { Button } from "@/components/ui/button"
import { MaterialsTable, MaterialsTableRef } from "@/components/materials-table"
import { MaterialForm } from "@/components/material-form"
import { BulkActionsBar } from "@/components/bulk-actions-bar"
import { BulkActionDialog } from "@/components/bulk-action-dialog"
import { useToast } from "@/components/ui/use-toast"
import { CategoryManager } from "@/components/category-manager"
import { SimpleSearch, SimpleSearchFilter } from "@/components/simple-search"
import { useLanguage } from "@/context/language-context"
import { UNITS_OF_MEASUREMENT } from "@/lib/constants"
import { Category } from "@/lib/types"

export function MaterialsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<any>()
  const [searchValue, setSearchValue] = useState("")
  const [searchFilters, setSearchFilters] = useState<SimpleSearchFilter[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<string[]>(UNITS_OF_MEASUREMENT.map(u => u.value))
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    isOpen: boolean;
    action: string;
  }>({ isOpen: false, action: '' })
  const [totalItemsCount, setTotalItemsCount] = useState(0)
  const [estimatedCount, setEstimatedCount] = useState(0)
  const tableRef = useRef<MaterialsTableRef>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  // Загружаем категории при первой загрузке
  useEffect(() => {
    fetchCategories();
  }, []);

  // Функция загрузки категорий
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Function to refresh the materials table
  const refreshMaterials = () => {
    // This will be passed to MaterialsTable to trigger refresh when needed
    if (tableRef.current?.refreshData) {
      tableRef.current.refreshData();
    }
  }

  // Handle enhanced search with filters
  const handleSearch = (value: string, filters: SimpleSearchFilter[]) => {
    setSearchValue(value);
    setSearchFilters(filters);
    setSearchLoading(true);
    
    // The table will handle the actual search when it receives the new searchValue
    // The table component will call onSearchComplete when done
  }

  // Called when search in the table is complete
  const handleSearchComplete = () => {
    setSearchLoading(false);
  }

  // Обработчик для получения общего количества элементов
  const handleTotalCountChange = (count: number) => {
    setTotalItemsCount(count);
  }

  // Получение текущих фильтров для групповых действий
  const getCurrentFilters = () => {
    const filters: any = {}
    
    // Добавляем фильтры из Enhanced Search
    searchFilters.forEach(filter => {
      if (filter.type === 'category') {
        filters.category = filter.value
      } else if (filter.type === 'unit') {
        filters.unit = filter.value
      } else if (filter.type === 'price') {
        // Для price фильтра может быть диапазон
        if (filter.value.includes('-')) {
          const [min, max] = filter.value.split('-').map((v: string) => parseFloat(v.trim()))
          filters.priceRange = { min, max }
        }
      }
    })
    
    // Добавляем поисковый запрос
    if (searchValue) {
      filters.search = searchValue
    }
    
    return filters
  }

  // Оценка количества элементов для группового действия
  const estimateGroupActionCount = async () => {
    try {
      const filters = getCurrentFilters()
      const response = await fetch('/api/material-items/group-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'estimate_count',
          groupCriteria: filters
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setEstimatedCount(result.estimatedCount || 0)
      }
    } catch (error) {
      console.error('Error estimating group action count:', error)
    }
  }

  // Обработчики массовых действий
  const handleBulkAction = (action: string, params?: any) => {
    if (['increase_price_percent', 'decrease_price_percent', 'update_currency_usd_rub', 'update_currency_rub_usd', 'copy_simple', 'copy_to_category', 'copy_with_changes', 'change_category'].includes(action)) {
      setBulkActionDialog({ isOpen: true, action });
    } else {
      // Простые действия без параметров
      executeBulkAction(action, params);
    }
  }

  const executeBulkAction = async (action: string, params?: any) => {
    try {
      // Используем только bulk-actions для выбранных элементов  
      const endpoint = '/api/material-items/bulk-actions'
      
      const requestData: any = {
        action,
        params: params || {}
      }
      
      // Обычные действия - используем выбранные элементы
      requestData.itemIds = selectedItems

      // Преобразуем action в формат API
      let apiAction = action;
      if (action === 'increase_price_percent') {
        apiAction = 'update_prices_percent';
        requestData.params.operation = 'increase';
      } else if (action === 'decrease_price_percent') {
        apiAction = 'update_prices_percent';
        requestData.params.operation = 'decrease';
      } else if (action === 'copy_simple') {
        apiAction = 'copy_materials';
      } else if (action === 'copy_to_category') {
        apiAction = 'copy_materials';
      } else if (action === 'copy_with_changes') {
        apiAction = 'copy_materials';
        if (params.priceAdjustmentType && params.priceAdjustmentValue) {
          requestData.params.priceAdjustment = {
            variant: params.priceAdjustmentType,
            value: params.priceAdjustmentValue
          };
        }
      } else if (action === 'change_category') {
        apiAction = 'update_category';
      } else if (action === 'delete_soft') {
        apiAction = 'delete_materials';
        requestData.params.permanent = false;
      }

      requestData.action = apiAction;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          variant: "success",
          title: t.bulkActions.success,
          description: result.message
        });
        
        // Обновляем таблицу
        if (tableRef.current) {
          tableRef.current.refreshData();
        }
        
        // Очищаем выбор после действия
        setSelectedItems([]);
      } else {
        toast({
          variant: "error",
          title: t.bulkActions.error,
          description: result.message
        });
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        variant: "error",
        title: t.bulkActions.error,
        description: "Произошла ошибка при выполнении массового действия"
      });
    }
  }

  const handleBulkActionSubmit = (params: any) => {
    executeBulkAction(bulkActionDialog.action, params);
    setBulkActionDialog({ isOpen: false, action: '' });
  }

  const handleClearSelection = () => {
    setSelectedItems([]);
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.materials.title}</h1>
          <p className="text-gray-600 mt-1">Управление материалами, категориями и ценами</p>
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
          <Button onClick={() => {
            setEditingMaterial(undefined)
            setIsFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t.materials.addButton}
          </Button>
          <Button onClick={() => setIsCategoryManagerOpen(true)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Управление категориями
          </Button>
        </div>
      </div>

      {/* Simple Search Field */}
      <div className="w-full px-6 pb-4 flex-shrink-0">
        <SimpleSearch
          placeholder={t.materials.searchPlaceholder}
          initialValue={searchValue}
          onSearch={handleSearch}
          disabled={false}
          className="w-full"
          categories={categories}
          units={units}
        />
      </div>

      {/* Main Content Grid - Full Height */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <BentoGrid className="h-full">
          {/* Materials Table */}
          <BentoCard size="2x2" className="col-span-full h-full">
            <MaterialsTable 
              ref={tableRef}
              onEdit={(material) => {
                setEditingMaterial(material)
                setIsFormOpen(true)
              }}
              onRefreshNeeded={refreshMaterials}
              onManageCategories={() => setIsCategoryManagerOpen(true)}
              searchTerm={searchValue}
              searchFilters={searchFilters}
              onSearchComplete={handleSearchComplete}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
          </BentoCard>
        </BentoGrid>
      </div>

      {/* Material Form Dialog */}
      <MaterialForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        material={editingMaterial}
        title={editingMaterial ? t.materialForm.editTitle : t.materialForm.addTitle}
        onSubmit={async (data) => {
          try {
            // Проверяем, является ли материал копией
            const isNewOrCopy = !editingMaterial?.id || editingMaterial._isCopy;
            
            const url = isNewOrCopy
              ? "/api/material-items"
              : `/api/material-items/${editingMaterial.id}`
            
            const method = isNewOrCopy ? "POST" : "PUT"
            
            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
            
            const result = await response.json()
            
            if (result.success) {
              toast({
                variant: "success",
                title: editingMaterial ? "Материал обновлен" : "Материал добавлен",
                description: result.message,
              })
              refreshMaterials() // Refresh materials table
              return Promise.resolve()
            } else {
              toast({
                variant: "error",
                title: "Ошибка",
                description: result.message || "Произошла ошибка при сохранении",
              })
              return Promise.reject(result.message)
            }
          } catch (error) {
            console.error("Error submitting material:", error)
            toast({
              variant: "error",
              title: "Ошибка",
              description: "Не удалось сохранить материал. Проверьте подключение к серверу.",
            })
            return Promise.reject("Ошибка сети")
          }
        }}
      />

      {/* Category Manager Dialog */}
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoriesChanged={() => {
          fetchCategories();
          refreshMaterials();
        }}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedItems={selectedItems}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        isOpen={bulkActionDialog.isOpen}
        onClose={() => setBulkActionDialog({ isOpen: false, action: '' })}
        onSubmit={handleBulkActionSubmit}
        action={bulkActionDialog.action}
        selectedCount={selectedItems.length}
        categories={categories}
      />
    </div>
  )
}
