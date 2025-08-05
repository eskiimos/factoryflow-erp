"use client"

import React, { useEffect, useState } from "react"
import { 
  Package, 
  FolderTree, 
  TrendingUp, 
  DollarSign,
  Plus,
  Search,
  Filter,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { KPIWidget } from "@/components/ui/kpi-widget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaterialsChart } from "@/components/materials-chart"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  totalMaterials: number
  activeCategories: number
  averagePrice: number
  totalValue: number
}

interface ChartData {
  topExpensiveMaterials: Array<{
    name: string
    price: number
    category: string
  }>
  materialsByCategory: Array<{
    name: string
    count: number
  }>
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMaterials: 0,
    activeCategories: 0,
    averagePrice: 0,
    totalValue: 0,
  })
  const [chartData, setChartData] = useState<ChartData>({
    topExpensiveMaterials: [],
    materialsByCategory: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const { data } = await response.json()
      setStats(data.stats)
      setChartData(data.charts)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Обзор системы</h1>
          <p className="text-gray-600 mt-1">Главная панель управления FactoryFlow ERP</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Поиск по системе..." 
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Link href="/materials">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить материал
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <BentoGrid>
        {/* KPI Cards */}
        <BentoCard size="1x1">
          <KPIWidget
            title="Всего материалов"
            value={stats.totalMaterials}
            icon={Package}
            description="Активных позиций"
          />
        </BentoCard>
        
        <BentoCard size="1x1">
          <KPIWidget
            title="Активных групп"
            value={stats.activeCategories}
            icon={FolderTree}
            description="Групп материалов"
          />
        </BentoCard>
        
        <BentoCard size="1x1">
          <KPIWidget
            title="Средняя цена"
            value={formatCurrency(stats.averagePrice)}
            icon={TrendingUp}
            description="За единицу"
          />
        </BentoCard>
        
        <BentoCard size="1x1">
          <KPIWidget
            title="Общая стоимость"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            description="Всех материалов"
          />
        </BentoCard>

        {/* Chart */}
        <BentoCard size="2x1">
          <MaterialsChart data={chartData.topExpensiveMaterials} />
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard size="2x1">
          <div className="h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
            <div className="space-y-3">
              <Link href="/materials" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Управление материалами</p>
                    <p className="text-sm text-gray-500">Добавление, редактирование материалов</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              
              <Link href="/analytics" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Аналитика и отчеты</p>
                    <p className="text-sm text-gray-500">Детальная статистика использования</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              
              <Link href="/settings" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Настройки системы</p>
                    <p className="text-sm text-gray-500">Конфигурация и параметры</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
