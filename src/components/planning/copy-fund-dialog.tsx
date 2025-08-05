'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, DollarSign, Calendar, Target, ArrowRight, AlertCircle, Users, Star } from "lucide-react"

interface Fund {
  id: string
  name: string
  description: string
  fundType: string
  totalAmount: number
  status: string
  createdAt: string
  categories: any[]
}

interface CopyFundDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CopyFundDialog({ isOpen, onClose, onSuccess }: CopyFundDialogProps) {
  const [funds, setFunds] = useState<Fund[]>([])
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [loading, setLoading] = useState(false)
  const [copying, setCopying] = useState(false)
  const [error, setError] = useState('')
  
  // Данные для новой копии
  const [copyData, setCopyData] = useState({
    name: '',
    description: '',
    totalAmount: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchFunds()
    }
  }, [isOpen])

  const fetchFunds = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/funds')
      if (response.ok) {
        const funds = await response.json()
        console.log('Loaded funds:', funds) // Для отладки
        setFunds(funds || [])
      } else {
        setError('Ошибка загрузки фондов')
      }
    } catch (error) {
      console.error('Error fetching funds:', error)
      setError('Ошибка загрузки фондов')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFund = (fund: Fund) => {
    setSelectedFund(fund)
    setCopyData({
      name: `Копия: ${fund.name}`,
      description: fund.description,
      totalAmount: fund.totalAmount.toString()
    })
  }

  const handleCopy = async () => {
    if (!selectedFund) return
    
    setCopying(true)
    setError('')
    
    try {
      console.log('Selected fund for copying:', selectedFund)
      console.log('Categories to copy:', selectedFund.categories)
      
      // Подготавливаем категории для копирования (убираем ID и связи)
      const categoriesToCopy = (selectedFund.categories || []).map((category: any) => ({
        name: category.name,
        categoryType: category.categoryType,
        plannedAmount: category.plannedAmount || 0,
        percentage: category.percentage,
        description: category.description || '',
        priority: category.priority || 1,
        items: (category.items || []).map((item: any) => ({
          name: item.name,
          itemType: item.itemType || 'OTHER',
          amount: item.amount || 0,
          currency: item.currency || 'RUB',
          percentage: item.percentage,
          description: item.description || '',
          isRecurring: item.isRecurring || false,
          priority: item.priority || 1
        }))
      }))
      
      console.log('Prepared categories for copying:', categoriesToCopy)
      
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: copyData.name,
          description: copyData.description,
          fundType: selectedFund.fundType,
          totalAmount: parseFloat(copyData.totalAmount) || 0,
          startDate: new Date().toISOString().split('T')[0],
          categories: categoriesToCopy
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при копировании фонда')
      }

      const newFund = await response.json()
      console.log('Created fund:', newFund)

      onSuccess()
    } catch (err) {
      console.error('Copy error:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setCopying(false)
    }
  }

  const getFundTypeLabel = (variant: string) => {
    const types: Record<string, string> = {
      'SALES': 'Фонд продаж',
      'PRODUCTION': 'Фонд производства',
      'MANAGEMENT': 'Фонд управления',
      'DEVELOPMENT': 'Фонд развития',
      'RESERVE': 'Резервный фонд',
      'PAYROLL': 'Фонд зарплат'
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Скопировать существующий фонд
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Шаг 1: Выбор фонда для копирования */}
          {!selectedFund && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Выберите фонд для копирования</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-600">Загрузка фондов...</p>
                </div>
              ) : funds.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Нет доступных фондов для копирования</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {funds.map((fund) => {
                    const hasCategories = fund.categories && fund.categories.length > 0
                    const totalItems = hasCategories ? fund.categories.reduce((total: number, cat: any) => total + (cat.items?.length || 0), 0) : 0
                    
                    return (
                      <Card 
                        key={fund.id} 
                        className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 ${
                          hasCategories 
                            ? 'ring-2 ring-green-200 border-green-300' 
                            : 'border-orange-200 hover:border-orange-300'
                        }`}
                        onClick={() => handleSelectFund(fund)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{fund.name}</CardTitle>
                              {hasCategories ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                  <Star className="w-3 h-3 mr-1" />
                                  Рекомендуется
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                                  ⚠️ Пустой
                                </span>
                              )}
                            </div>
                            <Badge className={getStatusColor(fund.status)}>
                              {fund.status === 'ACTIVE' ? 'Активный' : fund.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {getFundTypeLabel(fund.fundType)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">💰 Бюджет:</span>
                              <span className="text-sm font-medium">{formatCurrency(fund.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">📁 Категорий:</span>
                              <span className="text-sm font-medium">{fund.categories?.length || 0}</span>
                            </div>
                            {hasCategories && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">📋 Элементов:</span>
                                <span className="text-sm font-medium">{totalItems}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">🗓️ Создан:</span>
                              <span className="text-sm font-medium">
                                {new Date(fund.createdAt).toLocaleDateString('ru-RU', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            
                            {/* Дополнительная информация для фондов с категориями */}
                            {hasCategories && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-3">Детальный обзор категорий:</div>
                                <div className="space-y-2">
                                  {fund.categories.slice(0, 2).map((category: any, index: number) => {
                                    const categoryTotal = category.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0
                                    const avgAmount = category.items?.length > 0 ? categoryTotal / category.items.length : 0
                                    const categoryPercentage = fund.totalAmount > 0 ? (categoryTotal / fund.totalAmount * 100) : 0
                                    
                                    return (
                                      <div key={index} className="bg-gray-50 rounded-lg p-2 space-y-1">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-medium text-gray-700">
                                            📋 {category.name}
                                          </span>
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                            {category.items?.length || 0} позиций
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">💰 Сумма:</span>
                                            <span className="font-medium">{formatCurrency(categoryTotal)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">📊 Доля:</span>
                                            <span className="font-medium">{categoryPercentage.toFixed(1)}%</span>
                                          </div>
                                          {category.items?.length > 0 && (
                                            <>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">📈 Средняя:</span>
                                                <span className="font-medium">{formatCurrency(avgAmount)}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">🏷️ Тип:</span>
                                                <span className="font-medium capitalize">
                                                  {category.categoryType === 'salary' ? 'Зарплата' : 
                                                   category.categoryType === 'bonus' ? 'Премия' : 
                                                   category.categoryType || 'Другое'}
                                                </span>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        {category.plannedAmount && (
                                          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                            <span className="text-xs text-gray-500">🎯 Плановая сумма:</span>
                                            <span className="text-xs font-medium text-green-600">
                                              {formatCurrency(category.plannedAmount)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                  {fund.categories.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-2">
                                      <span className="font-medium">+{fund.categories.length - 2} категорий</span>
                                      <div className="mt-1">
                                        Общий объем: {formatCurrency(
                                          fund.categories.slice(2).reduce((total: number, cat: any) => 
                                            total + (cat.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0), 0
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {fund.description && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2 border-t border-gray-100 pt-2">
                                {fund.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Шаг 2: Настройка копии */}
          {selectedFund && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">Выбранный фонд:</h3>
                  <p className="text-sm text-gray-600">{selectedFund.name}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold">Новая копия:</h3>
                  <p className="text-sm text-gray-600">{copyData.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="copyName">Название новой копии *</Label>
                  <Input
                    id="copyName"
                    value={copyData.name}
                    onChange={(e) => setCopyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите название для копии"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyAmount">Общая сумма (₽)</Label>
                  <Input
                    id="copyAmount"
                    type="number"
                    step="0.01"
                    value={copyData.totalAmount}
                    onChange={(e) => setCopyData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="copyDescription">Описание</Label>
                  <Textarea
                    id="copyDescription"
                    value={copyData.description}
                    onChange={(e) => setCopyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание новой копии фонда..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Что будет скопировано:</h4>
                
                {/* Основная информация */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500 mb-1">Тип фонда</div>
                    <div className="text-sm font-medium">{getFundTypeLabel(selectedFund.fundType)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500 mb-1">Категорий</div>
                    <div className="text-sm font-medium">{selectedFund.categories?.length || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500 mb-1">Элементов</div>
                    <div className="text-sm font-medium">
                      {selectedFund.categories?.reduce((total: any, cat: any) => total + (cat.items?.length || 0), 0) || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500 mb-1">Общая сумма</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(
                        selectedFund.categories?.reduce((total: any, cat: any) => 
                          total + (cat.items?.reduce((sum: any, item: any) => sum + (item.amount || 0), 0) || 0), 0
                        ) || 0
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedFund.categories && selectedFund.categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium mb-3">Детализация по категориям:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedFund.categories.map((category: any, index: number) => {
                        const categoryTotal = category.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0
                        return (
                          <div key={index} className="bg-white rounded-lg p-3 border">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-800">{category.name}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {category.items?.length || 0} позиций
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Сумма:</span>
                                <span className="font-medium">{formatCurrency(categoryTotal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Тип:</span>
                                <span className="font-medium capitalize">
                                  {category.categoryType === 'salary' ? 'Зарплата' : 
                                   category.categoryType === 'bonus' ? 'Премия' : 
                                   category.categoryType || 'Другое'}
                                </span>
                              </div>
                              {category.plannedAmount && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Плановая:</span>
                                  <span className="font-medium text-green-600">{formatCurrency(category.plannedAmount)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-2">Также будут скопированы:</div>
                    <ul className="space-y-1">
                      <li>• Все настройки и приоритеты элементов</li>
                      <li>• Структура планирования и распределения</li>
                      <li>• Типы элементов и валюты</li>
                      <li>• Рекуррентные настройки</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedFund(null)}
                  disabled={copying}
                >
                  Назад
                </Button>
                <Button 
                  onClick={handleCopy}
                  disabled={copying || !copyData.name}
                  className="flex-1"
                >
                  {copying ? (
                    <>
                      <Calendar className="mr-2 h-4 w-4 animate-spin" />
                      Копирование...
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Создать копию
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
