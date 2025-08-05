'use client'

import React from 'react'
import PlanningPage from './planning-page-simple'
import { TrendingUp } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface PlanningPageWithPayrollProps {
  categories: Category[]
  departments: Department[]
}

export default function PlanningPageWithPayroll({ categories, departments }: PlanningPageWithPayrollProps) {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="bg-card rounded-lg">
          <PlanningPage categories={categories} />
        </div>
      </div>
    </div>
  )
}
