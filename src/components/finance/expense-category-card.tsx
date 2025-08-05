"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

type ExpenseItem = {
  id: string
  name: string
  amount: number
  notes?: string
}

type ExpenseCategory = {
  id: string
  name: string
  percentOfRevenue: number
  color: string
  items: ExpenseItem[]
}

type ExpenseCategoryCardProps = {
  category: ExpenseCategory
  totalRevenue: number
  onCategoryChange: (category: ExpenseCategory) => void
}

export function ExpenseCategoryCard({ 
  category, 
  totalRevenue,
  onCategoryChange 
}: ExpenseCategoryCardProps) {
  const [newItemName, setNewItemName] = useState("")
  
  const totalAmount = category.items.reduce((sum, item) => sum + item.amount, 0)
  const actualPercent = (totalAmount / totalRevenue) * 100
  
  const handleAddItem = () => {
    if (!newItemName.trim()) return
    
    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      amount: 0
    }
    
    onCategoryChange({
      ...category,
      items: [...category.items, newItem]
    })
    
    setNewItemName("")
  }
  
  const handleUpdateItem = (id: string, updates: Partial<ExpenseItem>) => {
    onCategoryChange({
      ...category,
      items: category.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    })
  }
  
  const handleRemoveItem = (id: string) => {
    onCategoryChange({
      ...category,
      items: category.items.filter(item => item.id !== id)
    })
  }
  
  const handlePercentChange = (newPercent: number) => {
    onCategoryChange({
      ...category,
      percentOfRevenue: newPercent
    })
  }

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <h3 className="font-medium text-sm">{category.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">
              {actualPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {category.items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 text-xs text-slate-500">{index + 1}</div>
                <div className="flex-1 text-xs">{item.name}</div>
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleUpdateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                  className="w-20 h-7 text-xs"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex mt-4 gap-2">
            <Input
              placeholder="Добавить статью расходов"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="text-xs h-8"
            />
            <Button 
              variant="default" 
              size="icon"
              className="h-8 w-8"
              onClick={handleAddItem}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="border-t p-3 flex justify-between items-center bg-slate-50">
          <span className="font-medium text-sm">Итого</span>
          <span className="font-bold text-sm">
            {new Intl.NumberFormat('ru-RU').format(totalAmount)} ₽
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
