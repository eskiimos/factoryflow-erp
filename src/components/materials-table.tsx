"use client"

import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"
import { SimpleSearchFilter } from "@/components/simple-search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Edit,
  Trash2
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { OptimizedMaterialsTable } from "@/components/optimized-materials-table"
import { TableColumnSettings } from "@/components/table-column-settings"
import { TablePresets } from "@/components/table-presets"
import { useMaterialsTableColumns } from "@/hooks/use-materials-table-columns"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MaterialItemWithCategory } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/context/language-context"
import { useSearchCache } from "@/lib/hooks/use-search-cache"

export interface MaterialsTableProps {
  onEdit?: (material: MaterialItemWithCategory) => void
  onRefreshNeeded?: () => void
  onManageCategories?: () => void
  searchTerm: string // Now required
  searchFilters?: SimpleSearchFilter[]
  onSearchComplete?: () => void
  selectedItems?: string[]
  onSelectionChange?: (selectedItems: string[]) => void
}

export interface MaterialsTableRef {
  refreshData: () => Promise<void>
}

export const MaterialsTable = forwardRef<MaterialsTableRef, MaterialsTableProps>(({ 
  onEdit,
  onRefreshNeeded,
  onManageCategories,
  searchTerm,
  searchFilters = [],
  onSearchComplete,
  selectedItems = [],
  onSelectionChange
}, ref) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null)
  const [materials, setMaterials] = useState<MaterialItemWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  
  // Настройки столбцов таблицы
  const {
    columns,
    isLoading: columnsLoading,
    updateColumns,
    getVisibleColumns,
    applyPreset
  } = useMaterialsTableColumns()
  
  // Обработчик применения пресета
  const handleApplyPreset = (presetId: string) => {
    applyPreset(presetId);
    const presetName = presetId === 'default' ? 'по умолчанию' : 
                       presetId === 'minimal' ? 'минимальный' : 
                       presetId === 'detailed' ? 'подробный' : 
                       presetId === 'analytics' ? 'аналитика' : presetId;
    
    toast({
      variant: "success",
      title: "Настройки применены",
      description: `Применен пресет "${presetName}"`
    });
  };

  // Рефы для отслеживания состояния запросов и оптимизации производительности
  const lastRequestIdRef = useRef<number>(0)
  const prevSearchRef = useRef<string>("")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [page, searchTerm, selectedCategoryId])
  
  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    refreshData: fetchMaterials
  }));
  
  // Fetch all categories for tabs
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const result = await response.json()
      // Проверяем, что данные существуют и это массив
      if (result.data && Array.isArray(result.data)) {
        setCategories(result.data)
      } else {
        console.warn("Categories data is not an array:", result)
        setCategories([]) // Устанавливаем пустой массив как fallback
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([]) // Устанавливаем пустой массив в случае ошибки
    }
  };

  const fetchMaterials = async () => {
    try {
      // Показываем скелетон при пустых результатах для быстрой обратной связи
      if (materials.length === 0) {
        setLoading(true);
      } else {
        // Для обновления существующих данных используем мягкую загрузку
        // чтобы избежать мигания интерфейса
      }
      
      // Создаем объект URLSearchParams для правильной генерации строки запроса
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', '20'); // Увеличиваем лимит для уменьшения запросов при пагинации
      
      // Добавляем поисковый запрос, только если он не пустой и достаточно длинный
      if (searchTerm && searchTerm.length >= 2) {
        searchParams.append('search', searchTerm);
      } else if (!selectedCategoryId) {
        // Если выбрана вкладка "Все группы" и нет поискового запроса,
        // добавляем параметр для показа всех материалов
        searchParams.append('showAll', 'true');
      }
      
      if (selectedCategoryId) searchParams.append('categoryId', selectedCategoryId);
      
      // Добавляем дополнительные фильтры из searchFilters
      searchFilters.forEach(filter => {
        if (filter.type === 'category') {
          searchParams.append('categoryId', filter.value);
        } else if (filter.type === 'unit') {
          searchParams.append('unit', filter.value);
        } else if (filter.type === 'price') {
          // Для price фильтра парсим диапазон
          const [min, max] = filter.value.split('-');
          if (min && min !== '0') {
            searchParams.append('minPrice', min);
          }
          if (max && max !== '999999') {
            searchParams.append('maxPrice', max);
          }
        }
      });
      
      // Генерируем строку запроса
      const queryString = searchParams.toString();
      
      // Создаем уникальный идентификатор запроса для отслеживания актуальных запросов
      const requestId = Date.now();
      lastRequestIdRef.current = requestId;
      
      // Фиксируем время начала запроса для измерения производительности
      const startTime = performance.now();
      
      const response = await fetch(`/api/material-items?${queryString}`);
      const result = await response.json();
      
      // Проверяем, что это самый последний запрос, чтобы избежать race conditions
      if (requestId !== lastRequestIdRef.current) {
        console.log("Skipping stale request results");
        return;
      }
      
      // Записываем метрику производительности
      const requestTime = performance.now() - startTime;
      console.log(`Search request completed in ${requestTime.toFixed(2)}ms`);
      
      // Проверяем структуру ответа и успешность запроса
      if (result.success && Array.isArray(result.data)) {
        // Используем плавную анимацию при обновлении результатов
        setMaterials(prev => {
          // Если предыдущий набор данных существенно отличается,
          // применяем анимацию обновления
          const hasMajorChanges = 
            prev.length !== result.data.length || 
            searchTerm !== prevSearchRef.current;
          
          // Обновляем ссылку на предыдущий поиск
          prevSearchRef.current = searchTerm;
          
          // Возвращаем новые данные
          return result.data;
        });
      } else {
        console.warn("Invalid response format or unsuccessful response:", result);
        setMaterials([]);
      }
      
      // Проверяем наличие данных о пагинации
      if (result.pagination && typeof result.pagination.totalPages === 'number') {
        setTotalPages(result.pagination.totalPages);
      } else {
        console.warn("Invalid pagination data:", result.pagination);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching materials:", error)
      // В случае ошибки устанавливаем пустой список и 1 страницу
      setMaterials([])
      setTotalPages(1)
      
      // Показываем уведомление об ошибке
      toast({
        variant: "error",
        title: "Ошибка поиска",
        description: "Не удалось загрузить материалы. Пожалуйста, попробуйте еще раз."
      })
    } finally {
      setLoading(false)
      // Notify parent that search is complete
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  }

  // Обработчик клика по кнопке копирования
  const handleCopyClick = (material: MaterialItemWithCategory) => {
    // Создаем копию материала с новым названием, но сохраняем необходимые свойства
    const copiedMaterial: MaterialItemWithCategory = {
      ...material,
      name: `Копия ${material.name}`,
      // Сохраняем оригинальный ID для типизации, но в форме редактирования он будет игнорироваться
      // при создании нового материала
    };
    
    if (onEdit) {
      // Передаем материал с флагом копирования
      onEdit({...copiedMaterial, _isCopy: true} as MaterialItemWithCategory);
    }
  }

  const handleDeleteClick = (id: string) => {
    setMaterialToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return

    try {
      const response = await fetch(`/api/material-items/${materialToDelete}`, { method: "DELETE" })
      const data = await response.json()
      
      if (data.success) {
        toast({
          variant: "success",
          title: "Материал удален",
          description: "Материал был успешно удален из системы"
        })
        
        fetchMaterials() // Refresh the list
        if (onRefreshNeeded) onRefreshNeeded()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: data.message || "Не удалось удалить материал"
        })
      }
    } catch (error) {
      console.error("Error deleting material:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить материал. Проверьте подключение к серверу."
      })
    } finally {
      setMaterialToDelete(null)
    }
  }

  if (loading || columnsLoading) {
    return (
      <Card className="h-full border-0 shadow-none">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-0 shadow-none flex flex-col">
      <CardHeader className="pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Материалы
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {getVisibleColumns().length} из {columns.length} столбцов
            </Badge>
          </div>
          <div className="flex items-center gap-2">            <TablePresets
              columns={columns}
              onApplyPreset={handleApplyPreset}
              className="mr-2"
            />
              <TableColumnSettings
                columns={columns}
                onColumnsChange={updateColumns}
                className="mr-2"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fetchMaterials()}
                className="h-9 w-9"
                title="Обновить"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={loading ? "animate-spin" : ""}
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </Button>
            </div>
        </div>
        
        {/* Group Tabs */}
        <div className="flex items-start gap-4">
          <Tabs 
            defaultValue="all" 
            value={selectedCategoryId || "all"}
            onValueChange={(value: string) => setSelectedCategoryId(value === "all" ? null : value)}
            className="flex-1 min-w-0"
          >
            <div className="relative overflow-hidden">
              <div 
                className="overflow-x-auto pb-2 scrollbar-none"
                onScroll={(e) => {
                  const target = e.target as HTMLElement;
                  const leftIndicator = target.parentElement?.querySelector('.scroll-indicator-left') as HTMLElement;
                  const rightIndicator = target.parentElement?.querySelector('.scroll-indicator-right') as HTMLElement;
                  
                  if (leftIndicator && rightIndicator) {
                    const isAtStart = target.scrollLeft === 0;
                    const isAtEnd = target.scrollLeft >= target.scrollWidth - target.clientWidth - 1;
                    
                    leftIndicator.style.opacity = isAtStart ? '0' : '1';
                    rightIndicator.style.opacity = isAtEnd ? '0' : '1';
                  }
                }}
                ref={(el) => {
                  if (el) {
                    // Проверяем нужны ли индикаторы при загрузке
                    setTimeout(() => {
                      const leftIndicator = el.parentElement?.querySelector('.scroll-indicator-left') as HTMLElement;
                      const rightIndicator = el.parentElement?.querySelector('.scroll-indicator-right') as HTMLElement;
                      
                      if (leftIndicator && rightIndicator) {
                        const hasOverflow = el.scrollWidth > el.clientWidth;
                        const isAtStart = el.scrollLeft === 0;
                        const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
                        
                        leftIndicator.style.opacity = hasOverflow && !isAtStart ? '1' : '0';
                        rightIndicator.style.opacity = hasOverflow && !isAtEnd ? '1' : '0';
                      }
                    }, 100);
                  }
                }}
              >
                <TabsList className="w-auto mb-2 inline-flex flex-nowrap min-w-max">
                  <TabsTrigger value="all" className="flex-shrink-0 whitespace-nowrap">
                    Все группы
                  </TabsTrigger>
                  {categories && Array.isArray(categories) && categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id} 
                      className="flex-shrink-0 whitespace-nowrap"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {/* Динамические индикаторы прокрутки */}
              <div className="scroll-indicator-left absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none opacity-0 transition-opacity duration-200" />
              <div className="scroll-indicator-right absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none opacity-0 transition-opacity duration-200" />
            </div>
          </Tabs>
          {onManageCategories && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-shrink-0 ml-2"
              onClick={onManageCategories}
            >
              <Settings className="h-3.5 w-3.5 mr-1" />
              Управление группами
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Результаты поиска */}
        {searchTerm && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {materials.length > 0 ? (
                <>
                  {(() => {
                    const { locale } = useLanguage();
                    
                    // Определяем склонение для количества в зависимости от языка
                    let suffix = '';
                    if (locale === 'ru') {
                      // Русские окончания
                      if (materials.length === 1) {
                        suffix = "материал";
                      } else if (materials.length > 1 && materials.length < 5) {
                        suffix = "материала";
                      } else {
                        suffix = "материалов";
                      }
                    } else {
                      // Английские окончания
                      suffix = materials.length === 1 ? "material" : "materials";
                    }

                    return t.materials.search.results
                      .replace('{count}', String(materials.length))
                      .replace('{query}', searchTerm)
                      .replace('{suffix}', suffix);
                  })()}
                </>
              ) : (
                <>{t.materials.search.noResults.replace('{query}', searchTerm)}</>
              )}
            </p>
          </div>
        )}

        {/* Оптимизированная таблица с виртуализацией для больших наборов данных */}
        <div className="flex-1 min-h-0">
          <OptimizedMaterialsTable 
            materials={materials}
            onEdit={(material) => onEdit && onEdit(material)}
            onDelete={(id) => handleDeleteClick(id)}
            onCopy={(material) => handleCopyClick(material)}
            searchTerm={searchTerm}
            height={window.innerHeight - 350} // Динамическая высота
            columns={getVisibleColumns()}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
          />
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0">
            <p className="text-sm text-gray-500">
              Страница {page} из {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удалить материал"
        description="Вы уверены, что хотите удалить этот материал? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </Card>
  );
});
