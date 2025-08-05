'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building, Users, Target, DollarSign, TrendingUp, Percent, Calendar } from "lucide-react"
import { CreateFund } from './create-fund'

interface FundCategoryItem {
  id: string
  name: string
  itemType: string
  amount: number
  currency: string
  description: string
  isRecurring: boolean
  priority: number
}

interface FundCategory {
  id: string
  name: string
  categoryType: string
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

  useEffect(() => {
    fetchFundsData()
  }, [])

  const fetchFundsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/funds')
      
      if (response.ok) {
        const data = await response.json()
        setFunds(data)
      }
    } catch (error) {
      console.error('Error fetching funds:', error)
    } finally {
      setLoading(false)
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
    switch (type) {
      case 'PRODUCTION': return <Building className="h-5 w-5" />
      case 'SALES': return <TrendingUp className="h-5 w-5" />
      case 'DEVELOPMENT': return <Target className="h-5 w-5" />
      case 'MARKETING': return <Users className="h-5 w-5" />
      default: return <DollarSign className="h-5 w-5" />
    }
  }

  const getFundTypeText = (variant: string) => {
    switch (type) {
      case 'PRODUCTION': return 'Фонд производства'
      case 'SALES': return 'Фонд отдела продаж'
      case 'DEVELOPMENT': return 'Фонд развития'
      case 'MARKETING': return 'Фонд маркетинга'
      default: return type
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
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Фонды</h1>
          <p className="text-gray-600 mt-1">Управление финансовыми фондами</p>
        </div>
        <Button onClick={() => setShowCreateFund(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать фонд
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий объем</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFundsAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Размещено</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocatedAmount)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Остаток</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRemainingAmount)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активных фондов</p>
                <p className="text-2xl font-bold text-gray-900">{funds.filter(f => f.status === 'ACTIVE').length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детализация фондов</CardTitle>
        </CardHeader>
        <CardContent>
          {funds.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных фондов</h3>
              <p className="text-gray-500 mb-6">Создайте первый фонд для управления финансами</p>
              <Button onClick={() => setShowCreateFund(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Создать фонд
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {funds.map((fund) => (
                <div key={fund.id} className="border rounded-lg overflow-hidden">
                  {/* Fund Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {getFundTypeIcon(fund.fundType)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{fund.name}</h3>
                          <p className="text-sm text-gray-600">{fund.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Общий объем</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(fund.totalAmount)}</p>
                        </div>
                        <Badge className={getStatusColor(fund.status)}>
                          {getStatusText(fund.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Categories Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Выручка
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {getFundTypeText(fund.fundType)}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Стоимость
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Фонд сырья
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Стоимость
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Налоги
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Стоимость
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Постоянные расходы
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Стоимость
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Прибыль
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Fund percentage row */}
                        <tr className="bg-green-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">100%</td>
                          <td className="px-6 py-4 text-sm text-red-600 font-medium">
                            {fund.categories.find(c => c.categoryType === 'EXPENSE')?.percentage || 0}%
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-medium">
                            {fund.categories.find(c => c.categoryType === 'EXPENSE')?.percentage || 0}%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                            {fund.categories.find(c => c.name.includes('сырь'))?.percentage || 0}%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                            {fund.categories.find(c => c.name.includes('Налог'))?.percentage || 0}%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                            {fund.categories.find(c => c.name.includes('Постоянн'))?.percentage || 0}%
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">
                            {100 - fund.categories.reduce((sum, c) => sum + (c.percentage || 0), 0)}%
                          </td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4"></td>
                        </tr>

                        {/* Fund data row */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-100">
                            {formatCurrency(fund.totalAmount)}
                          </td>
                          {fund.categories.map((category, index) => (
                            <>
                              <td key={`cat-${index}`} className="px-6 py-4 text-sm text-gray-900">
                                {category.name}
                              </td>
                              <td key={`amount-${index}`} className="px-6 py-4 text-sm text-gray-900">
                                {formatCurrency(category.plannedAmount)}
                              </td>
                            </>
                          ))}
                          {/* Fill remaining columns if fewer categories */}
                          {Array.from({ length: Math.max(0, 4 - fund.categories.length) }, (_, i) => (
                            <>
                              <td key={`empty-name-${i}`} className="px-6 py-4"></td>
                              <td key={`empty-amount-${i}`} className="px-6 py-4"></td>
                            </>
                          ))}
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            {formatCurrency(fund.remainingAmount)}
                          </td>
                        </tr>

                        {/* Employee rows */}
                        {fund.categories.map((category) =>
                          category.items.map((item, itemIndex) => (
                            <tr key={`${category.id}-${item.id}`} className={itemIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {itemIndex === 0 ? category.name : ''}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.amount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {item.itemType === 'SALARY' ? 'Зарплата' : 
                                 item.itemType === 'EXPENSE' ? 'Расходы' : item.itemType}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {item.isRecurring ? 'Ежемесячно' : 'Разовый'}
                              </td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4"></td>
                            </tr>
                          ))
                        )}

                        {/* Total row */}
                        <tr className="bg-blue-50 font-medium">
                          <td className="px-6 py-4 text-sm text-gray-900">Сумма</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(fund.categories.reduce((sum, c) => sum + c.plannedAmount, 0))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Сумма</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(fund.categories.find(c => c.name.includes('сырь'))?.plannedAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Сумма</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(fund.categories.find(c => c.name.includes('Налог'))?.plannedAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Сумма</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(fund.categories.find(c => c.name.includes('Постоянн'))?.plannedAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">Сумма</td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            {formatCurrency(fund.remainingAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Fund Dialog */}
      {showCreateFund && (
        <CreateFund 
          onClose={() => setShowCreateFund(false)}
          onSuccess={() => {
            setShowCreateFund(false)
            fetchFundsData()
          }}
          onBack={() => setShowCreateFund(false)}
        />
      )}
    </div>
  )
}
