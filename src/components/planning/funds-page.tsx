'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Plus,
  FileText,
  Calendar,
  Building,
  Percent
} from 'lucide-react'
import CreateFund from './create-fund'

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

interface FundTransaction {
  id: string
  transactionType: string
  amount: number
  currency: string
  description: string
  status: string
  transactionDate: string
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
  transactions: FundTransaction[]
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateFund, setShowCreateFund] = useState(false)

  useEffect(() => {
    fetchFunds()
  }, [])

  const fetchFunds = async () => {
    try {
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
      case 'PRODUCTION': return 'Производство'
      case 'SALES': return 'Продажи'
      case 'DEVELOPMENT': return 'Развитие'
      case 'MARKETING': return 'Маркетинг'
      default: return type
    }
  }

  const calculateUsagePercentage = (fund: Fund) => {
    if (fund.totalAmount === 0) return 0
    return ((fund.totalAmount - fund.remainingAmount) / fund.totalAmount) * 100
  }

  const totalFundsAmount = funds.reduce((sum, fund) => sum + fund.totalAmount, 0)
  const totalAllocatedAmount = funds.reduce((sum, fund) => sum + fund.allocatedAmount, 0)
  const totalRemainingAmount = funds.reduce((sum, fund) => sum + fund.remainingAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка фондов...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Фонды</h1>
          <p className="text-gray-600 mt-1">Управление финансовыми фондами и бюджетами</p>
        </div>
        <Button onClick={() => setShowCreateFund(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать фонд
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Общий объем фондов</p>
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
                <p className="text-sm font-medium text-gray-600">Размещено средств</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocatedAmount)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Остаток средств</p>
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
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funds List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {funds.map((fund) => (
          <Card key={fund.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFundTypeIcon(fund.fundType)}
                  <div>
                    <CardTitle className="text-lg">{fund.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{fund.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(fund.status)}>
                  {getStatusText(fund.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Fund Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Тип фонда</p>
                    <p className="text-sm text-gray-900">{getFundTypeText(fund.fundType)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Период действия</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(fund.startDate).toLocaleDateString('ru-RU')} - {new Date(fund.endDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Общий объем:</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(fund.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Размещено:</span>
                    <span className="text-sm text-gray-900">{formatCurrency(fund.allocatedAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Остаток:</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(fund.remainingAmount)}</span>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Использование средств</span>
                    <span className="text-sm text-gray-900 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {calculateUsagePercentage(fund).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateUsagePercentage(fund)} 
                    className="h-2"
                  />
                </div>

                {/* Categories Summary */}
                {fund.categories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Категории ({fund.categories.length})</p>
                    <div className="space-y-1">
                      {fund.categories.slice(0, 3).map((category) => (
                        <div key={category.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 truncate">{category.name}</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(category.plannedAmount)}</span>
                        </div>
                      ))}
                      {fund.categories.length > 3 && (
                        <p className="text-xs text-gray-500">и еще {fund.categories.length - 3} категорий...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                {fund.transactions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Последние операции</p>
                    <div className="space-y-1">
                      {fund.transactions.slice(0, 2).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 truncate">{transaction.description}</span>
                          <span className={`font-medium ${transaction.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Funds State */}
      {funds.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных фондов</h3>
            <p className="text-gray-500 mb-6">Создайте первый фонд для управления финансами</p>
            <Button onClick={() => setShowCreateFund(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Создать фонд
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Fund Dialog */}
      {showCreateFund && (
        <CreateFund 
          onClose={() => setShowCreateFund(false)}
          onSuccess={() => {
            setShowCreateFund(false)
            fetchFunds()
          }}
        />
      )}
    </div>
  )
}
