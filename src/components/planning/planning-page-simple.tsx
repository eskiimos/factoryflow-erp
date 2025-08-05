'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Building, Users, Target, DollarSign, TrendingUp, Percent, Calendar, Edit2, Settings, Trash2 } from "lucide-react"
import { InfoIcon } from "@/components/ui/info-icon"
import { CreateFund } from './create-fund'
import { EditFundDialog } from './edit-fund-dialog'
import { EditCategoryDialog } from './edit-category-dialog'
import { AddCategoryDialog } from './add-category-dialog'
import { EditItemDialog } from './edit-item-dialog'
import { EditTaxItemDialog } from './edit-tax-item-dialog'
import { AddItemDialog } from './add-item-dialog'
import { AddTaxItemDialog } from './add-tax-item-dialog'
import { AddBonusItemDialog } from './add-bonus-item-dialog'
import { AddDeductionItemDialog } from './add-deduction-item-dialog'
import { AddMaterialItemDialog } from './add-material-item-dialog'
import { AddRentItemDialog } from './add-rent-item-dialog'
import FundCreationChoiceDialog from './fund-creation-choice-dialog'
import CopyFundDialog from './copy-fund-dialog'

interface FundCategoryItem {
  id: string
  name: string
  itemType: string
  amount: number
  currency: string
  percentage?: number
  description: string
  isRecurring: boolean
  priority: number
}

interface FundCategory {
  id: string
  name: string
  categoryType: string
  emoji?: string
  plannedAmount: number
  actualAmount: number
  percentage: number
  description: string
  priority: number
  items: FundCategoryItem[]
}

interface Fund {
  id: string
  name: string
  description: string
  fundType: string
  totalAmount: number
  allocatedAmount: number
  remainingAmount: number
  status: string
  startDate: string
  endDate: string
  categories: FundCategory[]
}

interface PlanningPageProps {
  categories: { id: string; name: string }[]
}

export default function PlanningPage({ categories }: PlanningPageProps) {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateFund, setShowCreateFund] = useState(false)
  const [showChoiceDialog, setShowChoiceDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  
  // Edit dialogs state
  const [editFundDialog, setEditFundDialog] = useState<{ isOpen: boolean; fund: Fund | null }>({ isOpen: false, fund: null })
  const [editCategoryDialog, setEditCategoryDialog] = useState<{ isOpen: boolean; category: FundCategory | null; fundId: string }>({ isOpen: false, category: null, fundId: '' })
  const [addCategoryDialog, setAddCategoryDialog] = useState<{ isOpen: boolean; fundId: string }>({ isOpen: false, fundId: '' })
  const [editItemDialog, setEditItemDialog] = useState<{ isOpen: boolean; item: FundCategoryItem | null; categoryId: string; fundId: string }>({ isOpen: false, item: null, categoryId: '', fundId: '' })
  const [editTaxItemDialog, setEditTaxItemDialog] = useState<{ isOpen: boolean; item: FundCategoryItem | null; categoryId: string; fundId: string }>({ isOpen: false, item: null, categoryId: '', fundId: '' })
  const [addItemDialog, setAddItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string; categoryType?: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '', categoryType: '' })
  const [addTaxItemDialog, setAddTaxItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string; categoryType?: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '', categoryType: '' })
  
  // Specialized dialogs state
  const [addBonusItemDialog, setAddBonusItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
  const [addDeductionItemDialog, setAddDeductionItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
  const [addMaterialItemDialog, setAddMaterialItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
  const [addRentItemDialog, setAddRentItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
  // const [addTravelItemDialog, setAddTravelItemDialog] = useState<{ isOpen: boolean; categoryId: string; fundId: string; categoryName: string }>({ isOpen: false, categoryId: '', fundId: '', categoryName: '' }) // Временно отключено

  useEffect(() => {
    fetchFundsData()
  }, [])

  // Success callbacks for dialogs
  const handleItemSuccess = () => {
    if (addItemDialog.fundId) {
      recalculateFund(addItemDialog.fundId)
    }
  }

  const handleTaxItemSuccess = () => {
    if (addTaxItemDialog.fundId) {
      recalculateFund(addTaxItemDialog.fundId)
    }
  }

  const handleSpecializedItemSuccess = (fundId: string) => {
    recalculateFund(fundId)
  }

  // Recalculate fund automatically
  const recalculateFund = async (fundId: string) => {
    try {
      const response = await fetch(`/api/funds/${fundId}/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Fund recalculated:', result.message)
        await fetchFundsData() // Refresh data after recalculation
      } else {
        console.error('❌ Fund recalculation failed')
      }
    } catch (error) {
      console.error('❌ Error during fund recalculation:', error)
    }
  }

  const fetchFundsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/funds')
      
      if (response.ok) {
        const data = await response.json()
        setFunds(data)
        
        // Логгируем данные для отладки процентов
        data.forEach((fund: Fund) => {
          fund.categories.forEach((category: FundCategory) => {
            if (category.categoryType === 'taxes') {
              const calculatedPercentage = category.items.reduce((sum, item) => sum + (item.percentage || 0), 0)
              console.log(`Tax category "${category.name}":`, {
                storedPercentage: category.percentage,
                calculatedPercentage: calculatedPercentage.toFixed(1),
                items: category.items.map(item => ({ name: item.name, percentage: item.percentage }))
              })
            }
          })
        })
      }
    } catch (error) {
      console.error('Error fetching funds:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update fund
  const handleUpdateFund = async (fundId: string, data: Partial<Fund>) => {
    try {
      console.log('Updating fund:', fundId, data)
      const response = await fetch(`/api/funds/${fundId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      console.log('Update response:', result)
      
      if (response.ok) {
        console.log('Fund updated successfully, recalculating...')
        await recalculateFund(fundId) // Auto-recalculate after fund update
      } else {
        console.error('Update failed:', result)
      }
    } catch (error) {
      console.error('Error updating fund:', error)
    }
  }

  // Update category
  const handleUpdateCategory = async (categoryId: string, data: Partial<FundCategory>) => {
    try {
      console.log('Updating category:', categoryId, data)
      const response = await fetch(`/api/funds/${editCategoryDialog.fundId}/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      console.log('Category update response:', result)
      
      if (response.ok) {
        console.log('Category updated successfully, recalculating...')
        await recalculateFund(editCategoryDialog.fundId) // Auto-recalculate after category update
      } else {
        console.error('Category update failed:', result)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  // Add category
  const handleAddCategory = async (fundId: string, data: {
    name: string
    categoryType: string
    plannedAmount: number
    description: string
  }) => {
    console.log('🚀 handleAddCategory started with:', { fundId, data })
    
    try {
      // Добавляем приоритет по умолчанию
      const categoryData = {
        ...data,
        priority: 2 // Средний приоритет по умолчанию
      }
      
      console.log('📤 Sending request to API with data:', categoryData)
      
      const response = await fetch(`/api/funds/${fundId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      
      console.log('📥 API Response status:', response.status)
      
      const result = await response.json()
      console.log('📥 API Response data:', result)
      
      if (response.ok) {
        console.log('Category added successfully, recalculating...')
        await recalculateFund(fundId) // Auto-recalculate after category creation
      } else {
        console.error('Category add failed:', result)
        alert(`Ошибка добавления: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Ошибка при добавлении категории')
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      console.log('Deleting category:', categoryId)
      const response = await fetch(`/api/funds/${editCategoryDialog.fundId}/categories/${categoryId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      console.log('Category delete response:', result)
      
      if (response.ok) {
        console.log('Category deleted successfully, recalculating...')
        await recalculateFund(editCategoryDialog.fundId) // Auto-recalculate after category deletion
      } else {
        console.error('Category delete failed:', result)
        // Показать ошибку пользователю если нужно
        alert(`Ошибка удаления: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Ошибка при удалении категории')
    }
  }

  // Update item
  const handleUpdateItem = async (itemId: string, data: Partial<FundCategoryItem>) => {
    try {
      console.log('Updating item:', itemId, data)
      const response = await fetch(`/api/funds/${editItemDialog.fundId}/categories/${editItemDialog.categoryId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      console.log('Item update response:', result)
      
      if (response.ok) {
        console.log('Item updated successfully, recalculating...')
        await recalculateFund(editItemDialog.fundId) // Auto-recalculate after item update
      } else {
        console.error('Item update failed:', result)
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  // Handle tax item update wrapper
  const handleTaxItemUpdate = async (itemData: any) => {
    if (editTaxItemDialog.item) {
      await handleUpdateItem(editTaxItemDialog.item.id, itemData)
    }
  }

  // Delete fund
  const handleDeleteFund = async (fundId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот фонд? Это действие нельзя отменить.')) {
      return
    }
    
    try {
      console.log('Deleting fund:', fundId)
      const response = await fetch(`/api/funds/${fundId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      console.log('Delete response:', result)
      
      if (response.ok) {
        console.log('Fund deleted successfully, refreshing data...')
        await fetchFundsData() // Refresh data (fund deletion doesn't need recalculation)
      } else {
        console.error('Delete failed:', result)
        alert('Ошибка при удалении фонда: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting fund:', error)
      alert('Ошибка при удалении фонда')
    }
  }

  // Delete item
  const handleDeleteItem = async (itemId: string, categoryId: string, fundId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.')) {
      return
    }
    
    try {
      console.log('Deleting item:', itemId)
      const response = await fetch(`/api/funds/${fundId}/categories/${categoryId}/items/${itemId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      console.log('Delete item response:', result)
      
      if (response.ok) {
        console.log('Item deleted successfully, recalculating...')
        await recalculateFund(fundId) // Auto-recalculate after item deletion
      } else {
        console.error('Delete item failed:', result)
        alert('Ошибка при удалении элемента: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Ошибка при удалении элемента')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getFundTypeIcon = (variant: string) => {
    switch (variant) {
      case 'PRODUCTION': return <Building className="h-5 w-5" />
      case 'SALES': return <TrendingUp className="h-5 w-5" />
      case 'DEVELOPMENT': return <Target className="h-5 w-5" />
      case 'MARKETING': return <Users className="h-5 w-5" />
      default: return <DollarSign className="h-5 w-5" />
    }
  }

  const getFundTypeText = (variant: string) => {
    switch (variant) {
      case 'PRODUCTION': return 'Фонд производства'
      case 'SALES': return 'Фонд отдела продаж'
      case 'DEVELOPMENT': return 'Фонд развития'
      case 'MARKETING': return 'Фонд маркетинга'
      default: return variant
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активный'
      case 'PAUSED': return 'Приостановлен'
      case 'COMPLETED': return 'Завершен'
      case 'CANCELLED': return 'Отменен'
      default: return status
    }
  }

  // Вычисляем общие суммы
  const totalFundsAmount = funds.reduce((sum, fund) => sum + fund.totalAmount, 0)
  const totalAllocatedAmount = funds.reduce((sum, fund) => sum + fund.allocatedAmount, 0)
  const totalRemainingAmount = funds.reduce((sum, fund) => sum + fund.remainingAmount, 0)

  if (loading) {
    return (
      <div className="w-full min-h-screen px-6 py-6" style={{ maxWidth: 'calc(100vw - 240px)' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Фонды</h1>
            <p className="text-gray-600 mt-1">Управление финансовыми фондами</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка фондов...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-6 py-6" style={{ maxWidth: 'calc(100vw - 240px)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Фонды</h1>
            <InfoIcon content="Фонды - это финансовые пулы для планирования и управления бюджетом. Каждый фонд может содержать различные категории расходов с автоматическим расчетом процентов от выручки." />
          </div>
          <p className="text-gray-600 mt-1">Управление финансовыми фондами</p>
        </div>
        <Button onClick={() => setShowChoiceDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать фонд
        </Button>
      </div>

      {/* Fund Management Dashboard */}
      {funds.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Нет созданных фондов</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Создайте первый фонд для эффективного управления финансами и планирования бюджета
              </p>
              <Button onClick={() => setShowChoiceDialog(true)} className="bg-blue-600 hover:bg-blue-700 px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Создать фонд
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8" style={{ maxWidth: 'calc(95vw - 240px)', margin: '0 auto' }}>
          {funds.map((fund) => (
            <Card key={fund.id} className="shadow-lg overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {/* Elegant Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                        <div className="text-white">
                          {getFundTypeIcon(fund.fundType)}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{fund.name}</h2>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {fund.startDate 
                                ? new Date(fund.startDate).toLocaleDateString('ru-RU', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })
                                : 'Дата не указана'
                              }
                              {fund.endDate && ` - ${new Date(fund.endDate).toLocaleDateString('ru-RU', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 font-medium">Бюджет:</span>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(fund.totalAmount)}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm font-medium">
                            {getStatusText(fund.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setEditFundDialog({ isOpen: true, fund })}
                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm px-4 py-2 rounded-lg font-medium"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFund(fund.id)}
                        className="bg-white hover:bg-red-50 text-red-600 border-red-300 shadow-sm px-4 py-2 rounded-lg font-medium hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 bg-white">
                {/* Categories Horizontal Scroll */}
                <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #f9fafb' }}>
                  <div className="flex space-x-6">
                    
                    {/* All Categories */}
                    {fund.categories.map((category) => (
                      <div key={category.id} className={`bg-white border ${category.categoryType === 'taxes' ? 'border-blue-200' : 'border-gray-200'} rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex-shrink-0 flex flex-col`} style={{ width: '480px', minWidth: '480px', height: '500px' }}>
                          <div className={`${category.categoryType === 'taxes' ? 'bg-blue-50' : 'bg-gray-50'} p-4 rounded-t-xl border-b ${category.categoryType === 'taxes' ? 'border-blue-200' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${category.categoryType === 'taxes' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg flex items-center justify-center`}>
                                  <span className="text-base">{category.emoji || '🔧'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <h3 className={`text-lg font-semibold ${category.categoryType === 'taxes' ? 'text-blue-900' : 'text-gray-900'}`}>{category.name}</h3>
                                  <InfoIcon content={
                                    category.categoryType === 'taxes' 
                                      ? `Налоговая категория "${category.name}". Содержит налоги и сборы, рассчитываемые как процент от выручки компании.`
                                      : `Категория расходов "${category.name}". Может включать различные операционные расходы, инвестиции или специфические статьи бюджета компании.`
                                  } />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Процент выручки</p>
                                    <InfoIcon content={
                                      category.categoryType === 'taxes' 
                                        ? "Суммарный процент всех налогов в категории. Рассчитывается автоматически как сумма процентов отдельных налоговых элементов." 
                                        : "Процент от общей выручки компании, который автоматически выделяется на эту категорию расходов. Используется для планирования бюджета."
                                    } />
                                  </div>
                                  <p className="text-lg font-bold text-gray-800">
                                    {category.categoryType === 'taxes' 
                                      ? `${category.items.reduce((sum, item) => sum + (item.percentage || 0), 0).toFixed(1)}%`
                                      : `${category.percentage || 0}%`
                                    }
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditCategoryDialog({ 
                                    isOpen: true, 
                                    category, 
                                    fundId: fund.id 
                                  })}
                                  className="h-8 w-8 p-0 hover:bg-gray-200"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>                        
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
                            {category.items.map((item, itemIndex) => (
                              <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                <div className="flex items-center space-x-3">
                                  <span className="w-6 h-6 bg-gray-600 text-white rounded-full text-xs flex items-center justify-center font-medium">
                                    {itemIndex + 1}
                                  </span>
                                  <span className="font-medium text-gray-900 text-sm" title={item.name}>
                                    {item.name.length > 28 ? `${item.name.substring(0, 28)}...` : item.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`font-semibold ${category.categoryType === 'taxes' ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {category.categoryType === 'taxes' 
                                      ? `${item.percentage || 0}%` 
                                      : formatCurrency(item.amount)
                                    }
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (category.categoryType === 'taxes') {
                                        setEditTaxItemDialog({ 
                                          isOpen: true, 
                                          item, 
                                          categoryId: category.id, 
                                          fundId: fund.id 
                                        })
                                      } else {
                                        setEditItemDialog({ 
                                          isOpen: true, 
                                          item, 
                                          categoryId: category.id, 
                                          fundId: fund.id 
                                        })
                                      }
                                    }}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id, category.id, fund.id)}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-200 text-red-600 transition-opacity"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Bottom section with totals and add button - always at bottom */}
                          <div className="mt-auto pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ИТОГО:</span>
                                <InfoIcon content={
                                  category.categoryType === 'taxes' 
                                    ? "Общий налоговый процент от выручки. Сумма будет рассчитана автоматически на основе выручки компании." 
                                    : "Общая сумма всех элементов в данной категории. Автоматически обновляется при добавлении, изменении или удалении элементов."
                                } />
                              </div>
                              <span className={`text-lg font-bold ${category.categoryType === 'taxes' ? 'text-blue-900' : 'text-gray-900'}`}>
                                {category.categoryType === 'taxes'
                                  ? `${category.items.reduce((sum, item) => sum + (item.percentage || 0), 0).toFixed(1)}%`
                                  : formatCurrency(category.items.reduce((sum, item) => sum + item.amount, 0))
                                }
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Choose specialized dialog based on category type
                                switch (category.categoryType) {
                                  case 'taxes':
                                    setAddTaxItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name,
                                      categoryType: category.categoryType
                                    })
                                    break
                                  case 'bonus':
                                    setAddBonusItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name
                                    })
                                    break
                                  case 'deductions':
                                    setAddDeductionItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name
                                    })
                                    break
                                  case 'materials':
                                    setAddMaterialItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name
                                    })
                                    break
                                  case 'rent':
                                    setAddRentItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name
                                    })
                                    break
                                  case 'travel':
                                    // Временно используем обычный диалог для командировки
                                    setAddItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name,
                                      categoryType: category.categoryType
                                    })
                                    break
                                  default:
                                    setAddItemDialog({ 
                                      isOpen: true, 
                                      categoryId: category.id, 
                                      fundId: fund.id,
                                      categoryName: category.name,
                                      categoryType: category.categoryType
                                    })
                                }
                              }}
                              className={`w-full transition-colors ${
                                category.categoryType === 'taxes' 
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' 
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {(() => {
                                switch (category.categoryType) {
                                  case 'taxes': return 'Добавить налог'
                                  case 'bonus': return 'Добавить премию'
                                  case 'deductions': return 'Добавить удержание'
                                  case 'materials': return 'Добавить материалы'
                                  case 'rent': return 'Добавить аренду'
                                  case 'travel': return 'Добавить командировку'
                                  case 'salary': return 'Добавить зарплату'
                                  default: return 'Добавить элемент'
                                }
                              })()}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Category Button */}
                    <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex-shrink-0" style={{ width: '480px', minWidth: '480px' }}>
                      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center mb-4">
                          <Plus className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Добавить категорию</h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-xs">
                          Создайте новую категорию расходов для более детального планирования бюджета
                        </p>
                        <Button 
                          variant="outline"
                          size="lg"
                          onClick={() => setAddCategoryDialog({ isOpen: true, fundId: fund.id })}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 shadow-sm px-6 py-3 rounded-lg font-medium"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Добавить категорию
                        </Button>
                      </div>
                    </div>

                    {/* Profit Summary Card */}
                    <div className="bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex-shrink-0" style={{ width: '480px', minWidth: '480px' }}>
                      <div className="p-6 text-center h-full flex flex-col justify-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-100">📈 Прогнозируемая прибыль</h3>
                          <InfoIcon content="Расчетная прибыль, остающаяся после всех планируемых расходов. Рассчитывается как разность между общим бюджетом фонда и суммой всех категорий расходов." />
                        </div>
                        <div className="text-3xl font-bold mb-3 text-green-400">
                          {Math.round(((fund.totalAmount - fund.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0)) / fund.totalAmount) * 100)}%
                        </div>
                        <div className="text-xl font-bold text-gray-200 mb-2">
                          {formatCurrency(fund.totalAmount - fund.categories.reduce((sum, cat) => sum + cat.plannedAmount, 0))}
                        </div>
                        <p className="text-sm text-gray-400 bg-gray-800 rounded-full px-3 py-1">
                          от общего бюджета
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Fund Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Общий бюджет</p>
                          <InfoIcon content="Общая сумма средств, выделенная на данный фонд. Это максимальный лимит расходов по всем категориям фонда." />
                        </div>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(fund.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Распределено</p>
                          <InfoIcon content="Сумма средств, уже распределенная по категориям расходов. Показывает, сколько из общего бюджета уже запланировано к использованию." />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(fund.allocatedAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Percent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Использование</p>
                          <InfoIcon content="Процент использования общего бюджета фонда. Показывает, какая доля от общих средств уже распределена по категориям расходов." />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.round((fund.allocatedAmount / fund.totalAmount) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Категорий</p>
                          <InfoIcon content="Количество созданных категорий расходов в данном фонде. Каждая категория может содержать множество отдельных элементов расходов." />
                        </div>
                        <p className="text-xl font-bold text-gray-900">{fund.categories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fund Creation Choice Dialog */}
      <FundCreationChoiceDialog 
        isOpen={showChoiceDialog}
        onClose={() => setShowChoiceDialog(false)}
        onCreateNew={() => {
          setShowChoiceDialog(false)
          setShowCreateFund(true)
        }}
        onCopyExisting={() => {
          setShowChoiceDialog(false)
          setShowCopyDialog(true)
        }}
      />

      {/* Copy Fund Dialog */}
      <CopyFundDialog 
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        onSuccess={() => {
          setShowCopyDialog(false)
          fetchFundsData()
        }}
      />

      {/* Create Fund Dialog */}
      <Dialog open={showCreateFund} onOpenChange={setShowCreateFund}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Создать новый фонд
            </DialogTitle>
          </DialogHeader>
          <CreateFund 
            onClose={() => setShowCreateFund(false)}
            onSuccess={() => {
              setShowCreateFund(false)
              fetchFundsData()
            }}
            onBack={() => setShowCreateFund(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Fund Dialog */}
      {editFundDialog.isOpen && editFundDialog.fund && (
        <EditFundDialog
          fund={editFundDialog.fund}
          isOpen={editFundDialog.isOpen}
          onClose={() => setEditFundDialog({ isOpen: false, fund: null })}
          onSave={handleUpdateFund}
        />
      )}

      {/* Edit Category Dialog */}
      {editCategoryDialog.isOpen && editCategoryDialog.category && (
        <EditCategoryDialog
          category={editCategoryDialog.category}
          isOpen={editCategoryDialog.isOpen}
          onClose={() => setEditCategoryDialog({ isOpen: false, category: null, fundId: '' })}
          onSave={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Add Category Dialog */}
      {addCategoryDialog.isOpen && (
        <AddCategoryDialog
          fundId={addCategoryDialog.fundId}
          isOpen={addCategoryDialog.isOpen}
          onClose={() => setAddCategoryDialog({ isOpen: false, fundId: '' })}
          onAdd={handleAddCategory}
        />
      )}

      {/* Edit Item Dialog */}
      {editItemDialog.isOpen && editItemDialog.item && (
        <EditItemDialog
          item={editItemDialog.item}
          isOpen={editItemDialog.isOpen}
          onClose={() => setEditItemDialog({ isOpen: false, item: null, categoryId: '', fundId: '' })}
          onSave={handleUpdateItem}
        />
      )}

      {/* Edit Tax Item Dialog */}
      {editTaxItemDialog.isOpen && (
        <EditTaxItemDialog
          item={editTaxItemDialog.item}
          categoryId={editTaxItemDialog.categoryId}
          fundId={editTaxItemDialog.fundId}
          isOpen={editTaxItemDialog.isOpen}
          onClose={() => setEditTaxItemDialog({ isOpen: false, item: null, categoryId: '', fundId: '' })}
          onSave={handleTaxItemUpdate}
        />
      )}

      {/* Add Item Dialog */}
      {addItemDialog.isOpen && (
        <AddItemDialog
          categoryId={addItemDialog.categoryId}
          fundId={addItemDialog.fundId}
          categoryName={addItemDialog.categoryName}
          categoryType={addItemDialog.categoryType}
          isOpen={addItemDialog.isOpen}
          onClose={() => setAddItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '', categoryType: '' })}
          onSuccess={handleItemSuccess}
        />
      )}

      {/* Add Tax Item Dialog */}
      {addTaxItemDialog.isOpen && (
        <AddTaxItemDialog
          categoryId={addTaxItemDialog.categoryId}
          fundId={addTaxItemDialog.fundId}
          categoryName={addTaxItemDialog.categoryName}
          categoryType={addTaxItemDialog.categoryType}
          isOpen={addTaxItemDialog.isOpen}
          onClose={() => setAddTaxItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '', categoryType: '' })}
          onSuccess={handleTaxItemSuccess}
        />
      )}

      {/* Add Bonus Item Dialog */}
      {addBonusItemDialog.isOpen && (
        <AddBonusItemDialog
          isOpen={addBonusItemDialog.isOpen}
          onClose={() => setAddBonusItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })}
          onAdd={async (data) => {
            try {
              const response = await fetch(`/api/funds/${addBonusItemDialog.fundId}/categories/${addBonusItemDialog.categoryId}/items`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: data.name,
                  itemType: 'BONUS',
                  amount: data.amount || 0,
                  currency: 'RUB',
                  percentage: data.percentage || null,
                  description: JSON.stringify({
                    calculationType: data.calculationType,
                    employeeIds: data.employeeIds,
                    originalDescription: data.description
                  }),
                  isRecurring: false,
                  priority: 1
                })
              })

              if (!response.ok) {
                throw new Error('Failed to create bonus item')
              }

              await handleSpecializedItemSuccess(addBonusItemDialog.fundId)
              setAddBonusItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
            } catch (error) {
              console.error('Error adding bonus item:', error)
              alert('Ошибка при добавлении премии')
            }
          }}
        />
      )}

      {/* Add Deduction Item Dialog */}
      {addDeductionItemDialog.isOpen && (
        <AddDeductionItemDialog
          isOpen={addDeductionItemDialog.isOpen}
          onClose={() => setAddDeductionItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })}
          onAdd={async (data) => {
            try {
              const response = await fetch(`/api/funds/${addDeductionItemDialog.fundId}/categories/${addDeductionItemDialog.categoryId}/items`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: data.name,
                  itemType: 'DEDUCTION',
                  amount: data.amount || 0,
                  currency: 'RUB',
                  percentage: data.percentage || null,
                  description: JSON.stringify({
                    calculationType: data.calculationType,
                    baseType: data.baseType,
                    originalDescription: data.description
                  }),
                  isRecurring: false,
                  priority: 1
                })
              })

              if (!response.ok) {
                throw new Error('Failed to create deduction item')
              }

              await handleSpecializedItemSuccess(addDeductionItemDialog.fundId)
              setAddDeductionItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
            } catch (error) {
              console.error('Error adding deduction item:', error)
              alert('Ошибка при добавлении удержания')
            }
          }}
        />
      )}

      {/* Add Material Item Dialog */}
      {addMaterialItemDialog.isOpen && (
        <AddMaterialItemDialog
          isOpen={addMaterialItemDialog.isOpen}
          onClose={() => setAddMaterialItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })}
          onAdd={async (data) => {
            try {
              const response = await fetch(`/api/funds/${addMaterialItemDialog.fundId}/categories/${addMaterialItemDialog.categoryId}/items`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: data.name,
                  itemType: 'MATERIAL',
                  amount: data.totalAmount,
                  currency: 'RUB',
                  description: JSON.stringify({
                    materials: data.materials,
                    originalDescription: data.description
                  }),
                  isRecurring: false,
                  priority: 1
                })
              })

              if (!response.ok) {
                throw new Error('Failed to create material item')
              }

              await handleSpecializedItemSuccess(addMaterialItemDialog.fundId)
              setAddMaterialItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
            } catch (error) {
              console.error('Error adding material item:', error)
              alert('Ошибка при добавлении материалов')
            }
          }}
        />
      )}

      {/* Add Rent Item Dialog */}
      {addRentItemDialog.isOpen && (
        <AddRentItemDialog
          isOpen={addRentItemDialog.isOpen}
          onClose={() => setAddRentItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })}
          onAdd={async (data) => {
            try {
              const response = await fetch(`/api/funds/${addRentItemDialog.fundId}/categories/${addRentItemDialog.categoryId}/items`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: data.name,
                  itemType: 'RENT',
                  amount: data.amount,
                  currency: 'RUB',
                  description: JSON.stringify({
                    rentType: data.rentType,
                    frequency: data.frequency,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    area: data.area,
                    location: data.location,
                    originalDescription: data.description
                  }),
                  isRecurring: true, // Аренда обычно периодическая
                  priority: 1
                })
              })

              if (!response.ok) {
                throw new Error('Failed to create rent item')
              }

              await handleSpecializedItemSuccess(addRentItemDialog.fundId)
              setAddRentItemDialog({ isOpen: false, categoryId: '', fundId: '', categoryName: '' })
            } catch (error) {
              console.error('Error adding rent item:', error)
              alert('Ошибка при добавлении аренды')
            }
          }}
        />
      )}

      {/* Add Travel Item Dialog - временно отключен, используется обычный диалог */}
      </div>
  )
}
