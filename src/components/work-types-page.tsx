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
import { WorkTypesTable, WorkTypesTableRef } from "@/components/work-types-table"
import { WorkTypeForm } from "@/components/work-type-form"
import { useToast } from "@/components/ui/use-toast"
import { WorkTypeBulkActionsBar } from "@/components/work-type-bulk-actions-bar"
import { WorkTypeBulkActionDialog } from "@/components/work-type-bulk-action-dialog"
import { DepartmentManager } from "@/components/department-manager"
import { SimpleSearch, SimpleSearchFilter } from "@/components/simple-search"
import { useLanguage } from "@/context/language-context"
import { WORK_UNITS, SkillLevel } from "@/lib/types"
import type { Department, WorkTypeWithDepartment } from "@/lib/types"

export function WorkTypesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDepartmentManagerOpen, setIsDepartmentManagerOpen] = useState(false)
  const [editingWorkType, setEditingWorkType] = useState<WorkTypeWithDepartment>()
  const [searchValue, setSearchValue] = useState("")
  const [searchFilters, setSearchFilters] = useState<SimpleSearchFilter[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [skillLevels, setSkillLevels] = useState<string[]>(Object.values(SkillLevel))
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [totalItemsCount, setTotalItemsCount] = useState(0)
  const tableRef = useRef<WorkTypesTableRef>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  // Загружаем отделы при первой загрузке
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Функция загрузки отделов
  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const { data } = await response.json()
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  // Функция поиска
  const handleSearch = (value: string, filters: SimpleSearchFilter[]) => {
    setSearchValue(value)
    setSearchFilters(filters)
    setSearchLoading(true)
  }

  // Функция завершения поиска
  const handleSearchComplete = () => {
    setSearchLoading(false)
  }

  // Функция обновления таблицы
  const refreshWorkTypes = () => {
    if (tableRef.current) {
      tableRef.current.refreshData()
    }
  }

  // Bulk actions functionality
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    isOpen: boolean;
    action: string;
  }>({ isOpen: false, action: '' })
  
  // Handle bulk action
  const handleBulkAction = (action: string, params?: any) => {
    setBulkActionDialog({ isOpen: true, action })
  }

  // Execute bulk action
  const executeBulkAction = async (action: string, params?: any) => {
    try {
      const endpoint = '/api/work-types/bulk-actions'
      
      const requestData: any = {
        action,
        params: params || {},
        itemIds: selectedItems
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Действие выполнено",
          description: result.message
        })
        refreshWorkTypes()
        setSelectedItems([])
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
        description: "Произошла ошибка при выполнении массового действия"
      })
    }
  }

  const handleBulkActionSubmit = (params: any) => {
    executeBulkAction(bulkActionDialog.action, params)
    setBulkActionDialog({ isOpen: false, action: '' })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.workTypes.title}</h1>
          <p className="text-gray-600 mt-1">Управление видами работ и производственными операциями</p>
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
            setEditingWorkType(undefined)
            setIsFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t.workTypes.addButton}
          </Button>
          <Button onClick={() => setIsDepartmentManagerOpen(true)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Управление отделами
          </Button>
        </div>
      </div>

      {/* Simple Search Field */}
      <div className="w-full px-6 pb-4 flex-shrink-0">
        <SimpleSearch
          placeholder={t.workTypes.searchPlaceholder}
          initialValue={searchValue}
          onSearch={handleSearch}
          disabled={false}
          className="w-full"
          categories={departments.map(dept => ({ id: dept.id, name: dept.name }))}
          units={WORK_UNITS.map(unit => unit.value)}
        />
      </div>

      {/* Main Content Grid - Full Height */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <BentoGrid className="h-full">
          {/* Work Types Table */}
          <BentoCard size="2x2" className="col-span-full h-full">
            <WorkTypesTable 
              ref={tableRef}
              onEdit={(workType: any) => {
                setEditingWorkType(workType)
                setIsFormOpen(true)
              }}
              onRefreshNeeded={refreshWorkTypes}
              onManageDepartments={() => setIsDepartmentManagerOpen(true)}
              searchTerm={searchValue}
              searchFilters={searchFilters}
              onSearchComplete={handleSearchComplete}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
          </BentoCard>
        </BentoGrid>
      </div>

      {/* Work Type Form Dialog */}
      <WorkTypeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        workType={editingWorkType}
        title={editingWorkType ? t.workTypeForm.editTitle : t.workTypeForm.addTitle}
        onSubmit={async (data: any) => {
          try {
            // Проверяем, является ли тип работы копией
            const isNewOrCopy = !editingWorkType?.id || (editingWorkType as any)?._isCopy;
            
            const url = isNewOrCopy
              ? "/api/work-types"
              : `/api/work-types/${editingWorkType.id}`
            
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
                title: editingWorkType ? "Вид работы обновлен" : "Вид работы добавлен",
                description: result.message,
              })
              refreshWorkTypes()
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
            console.error("Error submitting work type:", error)
            toast({
              variant: "error",
              title: "Ошибка",
              description: "Не удалось сохранить вид работы. Проверьте подключение к серверу.",
            })
            return Promise.reject("Ошибка сети")
          }
        }}
      />

      {/* Department Manager Dialog */}
      <DepartmentManager
        isOpen={isDepartmentManagerOpen}
        onClose={() => setIsDepartmentManagerOpen(false)}
        onDepartmentsChanged={() => {
          fetchDepartments();
          refreshWorkTypes();
        }}
      />

      {/* Work Type Bulk Actions Bar */}
      <WorkTypeBulkActionsBar
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
        onBulkAction={handleBulkAction}
      />

      {/* Bulk Action Dialog */}
      <WorkTypeBulkActionDialog
        isOpen={bulkActionDialog.isOpen}
        onClose={() => setBulkActionDialog({ isOpen: false, action: '' })}
        onSubmit={handleBulkActionSubmit}
        action={bulkActionDialog.action}
        selectedCount={selectedItems.length}
        departments={departments}
      />
    </div>
  )
}
