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
      const { data } = await response.json()
      setDepartments(data)
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
    
    // Очистка ошибки при вводе
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Название отдела обязательно"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const url = editingDepartment 
        ? `/api/departments/${editingDepartment.id}`
        : "/api/departments"
      
      const method = editingDepartment ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: editingDepartment ? "Отдел обновлен" : "Отдел создан",
          description: result.message || "Операция выполнена успешно",
        })
        
        setEditingDepartment(null)
        fetchDepartments()
        onDepartmentsChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Произошла ошибка при сохранении",
        })
      }
    } catch (error) {
      console.error("Error saving department:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось сохранить отдел. Проверьте подключение к серверу.",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setDepartmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return

    try {
      const response = await fetch(`/api/departments/${departmentToDelete}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Отдел удален",
          description: result.message || "Отдел успешно удален",
        })
        
        fetchDepartments()
        onDepartmentsChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка удаления",
          description: result.message || "Не удалось удалить отдел",
        })
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить отдел. Проверьте подключение к серверу.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDepartmentToDelete(null)
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
      setSelectedDepartments(departments.map(dep => dep.id))
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
      const deletePromises = selectedDepartments.map(id =>
        fetch(`/api/departments/${id}`, { method: "DELETE" })
          .then(res => res.json())
      )

      const results = await Promise.all(deletePromises)
      const successful = results.filter(r => r.success).length
      const failed = results.length - successful

      if (successful > 0) {
        toast({
          variant: "success",
          title: "Отделы удалены",
          description: `Успешно удалено: ${successful} отделов${failed > 0 ? `, ошибок: ${failed}` : ''}`,
        })
        
        fetchDepartments()
        onDepartmentsChanged()
        setSelectedDepartments([])
      }
    } catch (error) {
      console.error("Error bulk deleting departments:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить отделы",
      })
    } finally {
      setBulkDeleteDialogOpen(false)
    }
  }

  const clearSelection = () => {
    setSelectedDepartments([])
  }
        })
      }
    } catch (error) {
      console.error("Error saving department:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось сохранить отдел. Проверьте подключение к серверу.",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return

    try {
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
      setDepartmentToDelete(null)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Управление отделами
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Add Department Button */}
              <div className="flex justify-end">
                <Button onClick={handleAddDepartment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить отдел
                </Button>
              </div>

              {/* Departments List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {departments.map((department) => (
                    <Card key={department.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{department.name}</CardTitle>
                              {department.description && (
                                <p className="text-sm text-gray-600 mt-1">{department.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={department.isActive ? "default" : "secondary"}>
                              {department.isActive ? (
                                <><CheckCircle className="h-3 w-3 mr-1" />Активен</>
                              ) : (
                                <><AlertTriangle className="h-3 w-3 mr-1" />Неактивен</>
                              )}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDepartment(department)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDepartment(department.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            <span>Видов работ: {department._count?.workTypes || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Сотрудников: {department._count?.employees || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {departments.length === 0 && (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Нет созданных отделов</p>
                      <p className="text-gray-400 text-sm mt-1">Создайте первый отдел для начала работы</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Редактировать отдел" : "Добавить отдел"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название отдела *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Например, Производственный цех"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder="Краткое описание отдела"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Активен</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {editingDepartment ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Удалить отдел"
        description="Вы уверены, что хотите удалить этот отдел? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </>
  )
}
