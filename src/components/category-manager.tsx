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
import { Edit, Trash2, Plus, Copy, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Category } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface CategoryFormData {
  name: string
  description: string
}

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  onCategoriesChanged: () => void
}

export function CategoryManager({
  isOpen,
  onClose,
  onCategoriesChanged
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  
  // Состояния для массовых действий
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || ""
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
  }, [editingCategory])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories")
      const { data } = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось загрузить группы материалов"
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
      newErrors.name = "Название группы обязательно"
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
      
      const url = isEditMode && editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories"
      
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
          title: isEditMode ? "Группа обновлена" : "Группа создана",
          description: result.message
        })
        
        fetchCategories()
        setEditingCategory(null)
        setFormData({ name: "", description: "" })
        onCategoriesChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Произошла ошибка при сохранении"
        })
      }
    } catch (error) {
      console.error("Error submitting category:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось сохранить группу. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/categories/${categoryToDelete}`, { 
        method: "DELETE" 
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Группа удалена",
          description: "Группа была успешно удалена из системы"
        })
        
        fetchCategories()
        onCategoriesChanged()
      } else {
        toast({
          variant: "error",
          title: "Ошибка",
          description: result.message || "Не удалось удалить группу"
        })
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить группу. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
      setCategoryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Функции для массовых действий
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map(cat => cat.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    try {
      setIsLoading(true)
      
      const deletePromises = selectedCategories.map(id =>
        fetch(`/api/categories/${id}`, { method: "DELETE" })
      )
      
      const results = await Promise.all(deletePromises)
      const responses = await Promise.all(results.map(r => r.json()))
      
      const successCount = responses.filter(r => r.success).length
      const errorCount = responses.length - successCount
      
      if (successCount > 0) {
        toast({
          variant: "success",
          title: "Группы удалены",
          description: `Успешно удалено ${successCount} групп${errorCount > 0 ? `, ${errorCount} не удалось удалить` : ''}`
        })
        
        fetchCategories()
        onCategoriesChanged()
        setSelectedCategories([])
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast({
          variant: "error",
          title: "Ошибка",
          description: "Не удалось удалить выбранные группы"
        })
      }
    } catch (error) {
      console.error("Error bulk deleting categories:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось удалить группы. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const handleBulkCopy = async () => {
    if (selectedCategories.length === 0) return
    
    try {
      setIsLoading(true)
      
      const categoriesToCopy = categories.filter(cat => selectedCategories.includes(cat.id))
      
      const copyPromises = categoriesToCopy.map(category =>
        fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `Копия ${category.name}`,
            description: category.description
          })
        })
      )
      
      const results = await Promise.all(copyPromises)
      const responses = await Promise.all(results.map(r => r.json()))
      
      const successCount = responses.filter(r => r.success).length
      const errorCount = responses.length - successCount
      
      if (successCount > 0) {
        toast({
          variant: "success",
          title: "Группы скопированы",
          description: `Успешно скопировано ${successCount} групп${errorCount > 0 ? `, ${errorCount} не удалось скопировать` : ''}`
        })
        
        fetchCategories()
        onCategoriesChanged()
        setSelectedCategories([])
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast({
          variant: "error",
          title: "Ошибка",
          description: "Не удалось скопировать выбранные группы"
        })
      }
    } catch (error) {
      console.error("Error bulk copying categories:", error)
      toast({
        variant: "error",
        title: "Ошибка",
        description: "Не удалось скопировать группы. Проверьте подключение к серверу."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedCategories([])
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[1200px] max-w-7xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление группами материалов</DialogTitle>
            <DialogDescription>
              Добавляйте, редактируйте и удаляйте группы материалов
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form */}
            <Card className="p-4 border">
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium mb-4">
                  {isEditMode ? "Редактировать группу" : "Добавить новую группу"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название группы</Label>
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
                        onClick={() => setEditingCategory(null)}
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
                <h3 className="text-lg font-medium mb-3">Существующие группы</h3>
                
                {/* Массовые действия */}
                {selectedCategories.length > 0 && (
                  <div className="flex items-center gap-3 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Выбрано: {selectedCategories.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkCopy}
                        disabled={isLoading}
                        className="h-8 border-blue-200 hover:bg-blue-100"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Копировать
                      </Button>
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
              
              {categories.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500">Нет доступных групп</p>
                </div>
              ) : (
                <>
                  {/* Выбрать все */}
                  <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      checked={selectedCategories.length === categories.length && categories.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Выбрать все ({categories.length})
                    </span>
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        Выбрано: {selectedCategories.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                        selectedCategories.includes(category.id) 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleSelectCategory(category.id, !!checked)}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${
                          selectedCategories.includes(category.id) ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-[280px]">
                          {category.description || "Нет описания"}
                        </p>
                        <Badge 
                          variant={category.isActive ? "default" : "secondary"}
                          className={category.isActive ? "bg-green-100 text-green-800 mt-1" : "mt-1"}
                        >
                          {category.isActive ? "Активная" : "Неактивная"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setEditingCategory(category)}
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDeleteClick(category.id)}
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
        title="Удалить группу"
        description="Вы уверены, что хотите удалить эту группу? Это может повлиять на материалы, связанные с ней."
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Удалить выбранные группы"
        description={`Вы уверены, что хотите удалить ${selectedCategories.length} выбранных групп? Это может повлиять на материалы, связанные с ними.`}
        confirmText="Удалить все"
        cancelText="Отмена"
      />
    </>
  )
}
