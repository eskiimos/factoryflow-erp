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
  Trash2,
  Copy,
  Building2,
  Clock,
  DollarSign,
  User
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency, formatDate } from "@/lib/utils"
import { WorkTypeWithDepartment, SkillLevel } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/context/language-context"
import { TableColumnSettings } from "@/components/table-column-settings"
import { TablePresets } from "@/components/table-presets"
import { useWorkTypesTableColumns } from "@/hooks/use-work-types-table-columns"

export interface WorkTypesTableProps {
  onEdit?: (workType: WorkTypeWithDepartment) => void
  onRefreshNeeded?: () => void
  onManageDepartments?: () => void
  searchTerm: string
  searchFilters?: SimpleSearchFilter[]
  onSearchComplete?: () => void
  selectedItems?: string[]
  onSelectionChange?: (selectedItems: string[]) => void
}

export interface WorkTypesTableRef {
  refreshData: () => Promise<void>
}

export const WorkTypesTable = forwardRef<WorkTypesTableRef, WorkTypesTableProps>(({ 
  onEdit,
  onRefreshNeeded,
  onManageDepartments,
  searchTerm,
  searchFilters = [],
  onSearchComplete,
  selectedItems = [],
  onSelectionChange
}, ref) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  
  // Хук для управления столбцами
  const {
    columns,
    updateColumns,
    getVisibleColumns,
    applyPreset
  } = useWorkTypesTableColumns()
  
  // Обработчик применения пресета
  const handleApplyPreset = (presetId: string) => {
    applyPreset(presetId);
    const presetName = presetId === 'default' ? 'по умолчанию' : 
                       presetId === 'minimal' ? 'минимальный' : 
                       presetId === 'detailed' ? 'подробный' : 
                       presetId === 'operations' ? 'операционный' : presetId;
    
    toast({
      title: "Пресет применен",
      description: `Применен пресет "${presetName}"`,
      variant: "success"
    });
  }
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workTypeToDelete, setWorkTypeToDelete] = useState<string | null>(null)
  const [workTypes, setWorkTypes] = useState<WorkTypeWithDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [departmentCounts, setDepartmentCounts] = useState<{[key: string]: number}>({})
  const [totalWorkTypesCount, setTotalWorkTypesCount] = useState(0)
  
  // Refs for request tracking
  const lastRequestIdRef = useRef<number>(0)
  const prevSearchRef = useRef<string>("")

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchWorkTypes()
  }, [page, searchTerm, selectedDepartmentId])

  // Обновляем счетчики отделов при изменении списка работ
  useEffect(() => {
    if (workTypes.length > 0 && !searchTerm && !selectedDepartmentId) {
      // Пересчитываем счетчики только если показываем все работы без фильтров
      fetchDepartments()
    }
  }, [workTypes.length])
  
  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    refreshData: fetchWorkTypes
  }));
  
  // Fetch all departments for tabs
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const result = await response.json()
      if (result.success) {
        setDepartments(result.data || [])
        
        // Создаем объект с количеством работ по отделам
        const counts: {[key: string]: number} = {}
        let totalCount = 0
        
        result.data?.forEach((dept: any) => {
          const workTypesCount = dept._count?.workTypes || 0
          counts[dept.id] = workTypesCount
          totalCount += workTypesCount
        })
        
        setDepartmentCounts(counts)
        setTotalWorkTypesCount(totalCount)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  };

  const fetchWorkTypes = async () => {
    try {
      if (workTypes.length === 0) {
        setLoading(true);
      }
      
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', '20');
      
      if (searchTerm && searchTerm.length >= 2) {
        searchParams.append('search', searchTerm);
      } else if (!selectedDepartmentId) {
        searchParams.append('showAll', 'true');
      }
      
      if (selectedDepartmentId) searchParams.append('departmentId', selectedDepartmentId);
      
      // Add additional filters from searchFilters
      searchFilters.forEach(filter => {
        if (filter.type === 'category') {
          searchParams.append('departmentId', filter.value);
        } else if (filter.type === 'unit') {
          searchParams.append('unit', filter.value);
        } else if (filter.type === 'price') {
          const [min, max] = filter.value.split('-');
          if (min && min !== '0') {
            searchParams.append('minRate', min);
          }
          if (max && max !== '999999') {
            searchParams.append('maxRate', max);
          }
        }
      });
      
      const requestId = Date.now();
      lastRequestIdRef.current = requestId;
      
      const response = await fetch(`/api/work-types?${searchParams.toString()}`);
      const result = await response.json();
      
      if (requestId !== lastRequestIdRef.current) {
        return;
      }
      
      if (result.success && Array.isArray(result.data)) {
        setWorkTypes(result.data);
        prevSearchRef.current = searchTerm;
      } else {
        console.warn("Invalid response format:", result);
        setWorkTypes([]);
      }
      
      if (result.pagination && typeof result.pagination.totalPages === 'number') {
        setTotalPages(result.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching work types:", error)
      setWorkTypes([])
      setTotalPages(1)
      
      toast({
        variant: "error",
        title: "Ошибка поиска",
        description: "Не удалось загрузить виды работ. Попробуйте еще раз."
      })
    } finally {
      setLoading(false)
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  }

  const handleCopyClick = (workType: WorkTypeWithDepartment) => {
    const copiedWorkType: WorkTypeWithDepartment = {
      ...workType,
      name: `Копия ${workType.name}`,
    };
    
    if (onEdit) {
      onEdit({...copiedWorkType, _isCopy: true} as WorkTypeWithDepartment);
    }
  }

  const handleDeleteClick = (id: string) => {
    setWorkTypeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!workTypeToDelete) return

    try {
      const response = await fetch(`/api/work-types/${workTypeToDelete}`, { method: "DELETE" })
      const data = await response.json()
      
      if (data.success) {
        toast({
          variant: "success",
          title: "Вид работы удален",
          description: "Вид работы был успешно удален из системы"
        })
        
        fetchWorkTypes()
        if (onRefreshNeeded) onRefreshNeeded()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: data.message || "Не удалось удалить вид работы"
        })
      }
    } catch (error) {
      console.error("Error deleting work type:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить вид работы. Проверьте подключение к серверу."
      })
    } finally {
      setWorkTypeToDelete(null)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = workTypes.map(wt => wt.id)
      onSelectionChange?.(allIds)
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, id])
    } else {
      onSelectionChange?.(selectedItems.filter(item => item !== id))
    }
  }

  const getSkillLevelBadge = (level: string) => {
    const colorMap = {
      [SkillLevel.TRAINEE]: "bg-green-100 text-green-800",
      [SkillLevel.WORKER]: "bg-blue-100 text-blue-800",
      [SkillLevel.SPECIALIST]: "bg-purple-100 text-purple-800",
      [SkillLevel.EXPERT]: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={colorMap[level as SkillLevel] || "bg-gray-100 text-gray-800"}>
        {level}
      </Badge>
    )
  }

  // Функция для рендеринга значения ячейки по ID столбца
  const renderCellValue = (workType: WorkTypeWithDepartment, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <div>
            <div className="font-medium">{workType.name}</div>
            {workType.description && (
              <div className="text-sm text-gray-500 mt-1">{workType.description}</div>
            )}
          </div>
        );
      case 'department':
        return (
          <Badge variant="outline" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {workType.department?.name || 'Не указан'}
          </Badge>
        );
      case 'unit':
        return workType.unit;
      case 'rate':
        return formatCurrency(workType.hourlyRate, workType.currency);
      case 'executor':
        return (
          <div className="flex flex-wrap gap-1">
            {workType.department?.employees && workType.department.employees.length > 0 ? (
              workType.department.employees.map((employee) => (
                <Badge key={employee.id} variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {employee.firstName} {employee.lastName}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400 text-xs">Не назначен</span>
            )}
          </div>
        );
      case 'skillLevel':
        return (
          <Badge 
            variant={
              workType.skillLevel === 'BEGINNER' ? 'secondary' :
              workType.skillLevel === 'INTERMEDIATE' ? 'default' :
              workType.skillLevel === 'ADVANCED' ? 'destructive' :
              'outline'
            }
            className="text-xs"
          >
            <User className="h-3 w-3 mr-1" />
            {workType.skillLevel === 'BEGINNER' ? 'Начальный' :
             workType.skillLevel === 'INTERMEDIATE' ? 'Средний' :
             workType.skillLevel === 'ADVANCED' ? 'Продвинутый' :
             workType.skillLevel === 'EXPERT' ? 'Эксперт' : workType.skillLevel}
          </Badge>
        );
      case 'standardTime':
        return workType.standardTime ? `${workType.standardTime * 60} мин` : '-';
      case 'description':
        return workType.description || '-';
      case 'equipmentRequired':
        return workType.equipmentRequired || '-';
      case 'safetyRequirements':
        return workType.safetyRequirements || '-';
      case 'currency':
        return workType.currency;
      case 'status':
        return (
          <Badge variant={workType.isActive ? "default" : "secondary"}>
            {workType.isActive ? "Активен" : "Неактивен"}
          </Badge>
        );
      case 'created':
        return formatDate(workType.createdAt);
      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit?.(workType)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDeleteClick(workType.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  // Функция для получения заголовка столбца по ID
  const getColumnHeader = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    return column?.label || columnId;
  };

  if (loading) {
    return (
      <Card className="h-full border-0 shadow-none">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Виды работ
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {getVisibleColumns().length} из {columns.length} столбцов
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TablePresets
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
              onClick={() => fetchWorkTypes()}
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
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Department Tabs */}
        <div className="flex items-start gap-4">
          <Tabs 
            defaultValue="all" 
            value={selectedDepartmentId || "all"}
            onValueChange={(value: string) => {
              setSelectedDepartmentId(value === "all" ? null : value)
              setPage(1)
              setLoading(true) // Показываем загрузку при смене вкладки
            }}
            className="flex-1 min-w-0"
          >
            <div className="relative overflow-hidden">
              <div 
                className="overflow-x-auto pb-1 scrollbar-none"
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
                    Все отделы
                  </TabsTrigger>
                  {departments.map((dept) => (
                    <TabsTrigger 
                      key={dept.id} 
                      value={dept.id} 
                      className="flex-shrink-0 whitespace-nowrap"
                    >
                      {dept.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {/* Динамические индикаторы прокрутки */}
              <div className="scroll-indicator-left absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none opacity-0 transition-opacity duration-200" />
              <div className="scroll-indicator-right absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none opacity-0 transition-opacity duration-200" />
            </div>
          </Tabs>
          {onManageDepartments && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-shrink-0 ml-2"
              onClick={onManageDepartments}
            >
              <Settings className="h-4 w-4 mr-2" />
              Управление отделами
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 px-6">
        {/* Search results info */}
        {searchTerm && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {workTypes.length > 0 ? (
                <>
                  Найдено {workTypes.length} {workTypes.length === 1 ? "вид работы" : 
                    workTypes.length < 5 ? "вида работ" : "видов работ"} по запросу "{searchTerm}"
                </>
              ) : (
                <>Не найдено видов работ по запросу "{searchTerm}"</>
              )}
            </p>
          </div>
        )}

        {/* Work Types Table */}
        <div className="flex-1 min-h-0 overflow-auto transition-opacity duration-200" style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === workTypes.length && workTypes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {getVisibleColumns().map((column) => (
                    <TableHead 
                      key={column.id}
                      className={column.id === 'actions' ? 'w-20' : ''}
                    >
                      {getColumnHeader(column.id)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {workTypes.map((workType) => (
                  <TableRow key={workType.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(workType.id)}
                        onCheckedChange={(checked) => handleSelectItem(workType.id, checked as boolean)}
                      />
                    </TableCell>
                    {getVisibleColumns().map((column) => (
                      <TableCell key={column.id}>
                        {renderCellValue(workType, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && workTypes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Нет доступных видов работ</p>
            </div>
          )}
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
        title="Удалить вид работы"
        description="Вы уверены, что хотите удалить этот вид работы? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </Card>
  );
});

WorkTypesTable.displayName = "WorkTypesTable"
