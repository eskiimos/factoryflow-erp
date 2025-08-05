"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Plus, Copy, CheckSquare, Square, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Department } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface DepartmentFormData {
  name: string
  description: string
}

interface DepartmentManagerProps {
  isOpen: boolean
  onClose: () => void
  onDepartmentsChanged: () => void
}

export function DepartmentManager({
  isOpen,
  onClose,
  onDepartmentsChanged
}: DepartmentManagerProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)
  
  // Состояния для массовых действий
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        name: editingDepartment.name,
        description: editingDepartment.description || ""
      })
      setIsEditMode(true)
    } else {
      setFormData({
        name: "",
        description: ""
      })
      setIsEditMode(false)
    }
    setErrors({})
  }, [editingDepartment])

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/departments")
      const result = await response.json()
      if (result.success) {
        setDepartments(result.data || [])
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Не удалось загрузить отделы"
        })
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось загрузить отделы"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) {
      newErrors.name = "Название отдела обязательно"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    try {
      setIsLoading(true)
      
      const url = isEditMode && editingDepartment 
        ? `/api/departments/${editingDepartment.id}`
        : "/api/departments"
      
      const method = isEditMode ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: isEditMode ? "Отдел обновлен" : "Отдел создан",
          description: result.message
        })
        
        fetchDepartments()
        setEditingDepartment(null)
        setFormData({ name: "", description: "" })
        onDepartmentsChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Произошла ошибка при сохранении"
        })
      }
    } catch (error) {
      console.error("Error submitting department:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось сохранить отдел. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDepartmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/departments/${departmentToDelete}`, { 
        method: "DELETE" 
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Отдел удален",
          description: "Отдел был успешно удален из системы"
        })
        
        fetchDepartments()
        onDepartmentsChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Не удалось удалить отдел"
        })
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить отдел. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
      setDepartmentToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Функции для массовых действий
  const handleSelectDepartment = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, departmentId])
    } else {
      setSelectedDepartments(prev => prev.filter(id => id !== departmentId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDepartments(departments.map(dept => dept.id))
    } else {
      setSelectedDepartments([])
    }
  }

  const handleBulkDelete = () => {
    if (selectedDepartments.length === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    try {
      setIsLoading(true)
      
      const deletePromises = selectedDepartments.map(id =>
        fetch(`/api/departments/${id}`, { method: "DELETE" })
      )
      
      const results = await Promise.all(deletePromises)
      const responses = await Promise.all(results.map(r => r.json()))
      
      const successCount = responses.filter(r => r.success).length
      const errorCount = responses.length - successCount
      
      if (successCount > 0) {
        toast({
          variant: "success",
          title: "Отделы удалены",
          description: `Успешно удалено ${successCount} отделов${errorCount > 0 ? `, ${errorCount} не удалось удалить` : ''}`
        })
        
        fetchDepartments()
        onDepartmentsChanged()
        setSelectedDepartments([])
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast({
          variant: "error",
          title: "Ошибка",
          description: "Не удалось удалить выбранные отделы"
        })
      }
    } catch (error) {
      console.error("Error bulk deleting departments:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить отделы. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const clearSelection = () => {
    setSelectedDepartments([])
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[1200px] max-w-7xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление отделами</DialogTitle>
            <DialogDescription>
              Добавляйте, редактируйте и удаляйте отделы
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="p-4 border">
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium mb-4">
                  {isEditMode ? "Редактировать отдел" : "Добавить новый отдел"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название отдела</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Описание (опционально)</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    {isEditMode && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setEditingDepartment(null)}
                      >
                        Отмена
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="ml-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Сохранение...
                        </span>
                      ) : isEditMode ? "Обновить" : "Добавить"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* List */}
            <Card className="p-4 border">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-3">Существующие отделы</h3>
                
                {/* Массовые действия */}
                {selectedDepartments.length > 0 && (
                  <div className="flex items-center gap-3 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Выбрано: {selectedDepartments.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isLoading}
                        className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8 text-gray-600 hover:bg-gray-100"
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {departments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500">Нет доступных отделов</p>
                </div>
              ) : (
                <>
                  {/* Выбрать все */}
                  <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      checked={selectedDepartments.length === departments.length && departments.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Выбрать все ({departments.length})
                    </span>
                    {selectedDepartments.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        Выбрано: {selectedDepartments.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {departments.map((department) => (
                    <div 
                      key={department.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        selectedDepartments.includes(department.id) 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={selectedDepartments.includes(department.id)}
                        onCheckedChange={(checked) => handleSelectDepartment(department.id, !!checked)}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          selectedDepartments.includes(department.id) ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {department.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-[280px]">
                          {department.description || "Нет описания"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={department.isActive ? "default" : "secondary"}
                            className={department.isActive ? "bg-green-100 text-green-800" : ""}
                          >
                            {department.isActive ? "Активный" : "Неактивный"}
                          </Badge>
                          {(department as any)._count && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                Видов работ: {(department as any)._count.workTypes || 0}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Сотрудников: {(department as any)._count.employees || 0}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setEditingDepartment(department)}
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteClick(department.id)}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удалить отдел"
        description="Вы уверены, что хотите удалить этот отдел? Это может повлиять на виды работ и сотрудников, связанных с ним."
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Удалить выбранные отделы"
        description={`Вы уверены, что хотите удалить ${selectedDepartments.length} выбранных отделов? Это может повлиять на виды работ и сотрудников, связанных с ними.`}
        confirmText="Удалить все"
        cancelText="Отмена"
      />
    </>
  )
}
