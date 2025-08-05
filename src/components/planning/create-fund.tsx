'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Trash2, DollarSign, Calendar, Target, AlertCircle, Banknote, HelpCircle } from "lucide-react"

interface CreateFundProps {
  onSuccess?: () => void
  onBack?: () => void
  onClose?: () => void
}

interface FundCategory {
  id: string
  name: string
  categoryType: 'INCOME' | 'EXPENSE'
  plannedAmount: number
  percentage?: number
  description?: string
  priority: number
  items: FundCategoryItem[]
}

interface FundCategoryItem {
  id: string
  name: string
  itemType: string
  amount: number
  currency: string
  percentage?: number
  description?: string
  isRecurring: boolean
  priority: number
}

export function CreateFund({ onSuccess, onBack }: CreateFundProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fundType: 'SALES',
    totalAmount: '',
    startDate: '',
    endDate: ''
  })

  const [categories, setCategories] = useState<FundCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const fundTypes = [
    { value: 'SALES', label: 'Фонд продаж' },
    { value: 'PRODUCTION', label: 'Фонд производства' },
    { value: 'MANAGEMENT', label: 'Фонд управления' },
    { value: 'DEVELOPMENT', label: 'Фонд развития' },
    { value: 'RESERVE', label: 'Резервный фонд' }
  ]

  const categoryTypes = [
    { value: 'INCOME', label: 'Доходы' },
    { value: 'EXPENSE', label: 'Расходы' }
  ]

  const itemTypes = [
    { value: 'SALARY', label: 'Зарплата' },
    { value: 'BONUS', label: 'Премия' },
    { value: 'EXPENSE', label: 'Расходы' },
    { value: 'EQUIPMENT', label: 'Оборудование' },
    { value: 'OTHER', label: 'Прочее' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCategory = () => {
    const newCategory: FundCategory = {
      id: Date.now().toString(),
      name: '',
      categoryType: 'EXPENSE',
      plannedAmount: 0,
      percentage: 0,
      description: '',
      priority: categories.length + 1,
      items: []
    }
    setCategories(prev => [...prev, newCategory])
  }

  const updateCategory = (categoryId: string, field: string, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ))
  }

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
  }

  const addCategoryItem = (categoryId: string) => {
    const newItem: FundCategoryItem = {
      id: Date.now().toString(),
      name: '',
      itemType: 'OTHER',
      amount: 0,
      currency: 'RUB',
      percentage: 0,
      description: '',
      isRecurring: false,
      priority: 1
    }
    
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: [...cat.items, newItem] }
        : cat
    ))
  }

  const updateCategoryItem = (categoryId: string, itemId: string, field: string, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            items: cat.items.map(item => 
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : cat
    ))
  }

  const removeCategoryItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
        : cat
    ))
  }

  const calculateTotalAllocated = () => {
    return categories.reduce((total, category) => {
      return total + category.items.reduce((catTotal, item) => catTotal + item.amount, 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : 0,
          categories: categories.map(cat => ({
            ...cat,
            items: cat.items.map(item => ({
              ...item,
              amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
              percentage: typeof item.percentage === 'string' ? parseFloat(item.percentage) : item.percentage
            }))
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании фонда')
      }

      setSuccess(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <Target className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Фонд создан успешно!
        </h3>
        <p className="text-gray-600 mb-4">
          Фонд добавлен в систему управления финансами
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setSuccess(false)}>
            Создать еще один фонд
          </Button>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Вернуться к списку
            </Button>
          )}
        </div>
      </div>
    )
  }

  const totalAllocated = calculateTotalAllocated()
  const totalAmount = parseFloat(formData.totalAmount) || 0
  const remaining = totalAmount - totalAllocated

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Основная информация</TabsTrigger>
            <TabsTrigger value="categories">Категории и статьи</TabsTrigger>
            <TabsTrigger value="summary">Итоги</TabsTrigger>
          </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Название фонда *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Укажите понятное название фонда, например "Фонд продаж Q1 2025"</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Введите название фонда"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="fundType">Тип фонда *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Выберите тип фонда в зависимости от его назначения</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={formData.fundType}
                    onValueChange={(value) => handleInputChange('fundType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fundTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="totalAmount">Общая сумма фонда (₽)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Общий бюджет фонда, который будет распределен по категориям</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="startDate">Дата начала</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Дата начала действия фонда и планирования расходов</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Подробное описание назначения фонда, целей и планируемых результатов</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Описание назначения и целей фонда..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Категории расходов и доходов</h3>
                <Button type="button" onClick={addCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить категорию
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <Card key={category.id} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="space-y-2 flex-1">
                            <Input
                              placeholder="Название категории"
                              value={category.name}
                              onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                            />
                          </div>
                          <Select
                            value={category.categoryType}
                            onValueChange={(value) => updateCategory(category.id, 'categoryType', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Статьи расходов/доходов</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCategoryItem(category.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Добавить статью
                          </Button>
                        </div>

                        {category.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg">
                            <Input
                              placeholder="Название статьи"
                              value={item.name}
                              onChange={(e) => updateCategoryItem(category.id, item.id, 'name', e.target.value)}
                            />
                            <Select
                              value={item.itemType}
                              onValueChange={(value) => updateCategoryItem(category.id, item.id, 'itemType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {itemTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Сумма"
                              value={item.amount}
                              onChange={(e) => updateCategoryItem(category.id, item.id, 'amount', e.target.value)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="% от общего"
                              value={item.percentage || ''}
                              onChange={(e) => updateCategoryItem(category.id, item.id, 'percentage', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCategoryItem(category.id, item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Общая сумма фонда</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalAmount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Распределено</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {totalAllocated.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Остаток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                      {remaining.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Детализация по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categoryTotal = category.items.reduce((sum, item) => sum + (typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount), 0)
                      return (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{category.name || 'Без названия'}</h4>
                              <Badge variant={category.categoryType === 'INCOME' ? 'default' : 'secondary'}>
                                {category.categoryType === 'INCOME' ? 'Доходы' : 'Расходы'}
                              </Badge>
                            </div>
                            <div className="font-bold">
                              {categoryTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {category.items.length} статей расходов/доходов
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-6 border-t">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Назад
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.fundType}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Calendar className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Создать фонд
                </>
              )}
            </Button>
          </div>
        </form>
    </div>
  )
}
