"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Department } from "@/lib/types"
import { Building2, Copy, DollarSign, Percent, Trash2 } from "lucide-react"

interface WorkTypeBulkActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (params: any) => void
  action: string
  selectedCount: number
  departments: Department[]
}

export function WorkTypeBulkActionDialog({
  isOpen,
  onClose,
  onSubmit,
  action,
  selectedCount,
  departments
}: WorkTypeBulkActionDialogProps) {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({})
    onClose()
  }

  const getDialogConfig = () => {
    switch (action) {
      case 'copy_to_department':
        return {
          title: 'Копировать в другой отдел',
          icon: <Building2 className="h-5 w-5" />,
          description: `Копировать ${selectedCount} вид(ов) работ в другой отдел`,
          fields: (
            <div>
              <Label htmlFor="targetDepartment">Выберите отдел</Label>
              <Select value={formData.targetDepartment} onValueChange={(value) => setFormData({...formData, targetDepartment: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
      
      case 'copy_with_changes':
        return {
          title: 'Копировать с изменениями',
          icon: <Copy className="h-5 w-5" />,
          description: `Копировать ${selectedCount} вид(ов) работ с изменениями`,
          fields: (
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetDepartment">Отдел (опционально)</Label>
                <Select value={formData.targetDepartment} onValueChange={(value) => setFormData({...formData, targetDepartment: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оставить текущий отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rateAdjustment">Корректировка тарифа</Label>
                <div className="flex gap-2">
                  <Select value={formData.rateAdjustmentType} onValueChange={(value) => setFormData({...formData, rateAdjustmentType: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="fixed">Фикс.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Значение"
                    value={formData.rateAdjustmentValue}
                    onChange={(e) => setFormData({...formData, rateAdjustmentValue: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )
        }
      
      case 'increase_rate_percent':
      case 'decrease_rate_percent':
        return {
          title: action === 'increase_rate_percent' ? 'Увеличить тариф' : 'Уменьшить тариф',
          icon: <Percent className="h-5 w-5" />,
          description: `${action === 'increase_rate_percent' ? 'Увеличить' : 'Уменьшить'} тариф для ${selectedCount} вид(ов) работ`,
          fields: (
            <div>
              <Label htmlFor="percentage">Процент</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                placeholder="Например, 10"
                value={formData.percentage}
                onChange={(e) => setFormData({...formData, percentage: e.target.value})}
              />
            </div>
          )
        }
      
      case 'set_fixed_rate':
        return {
          title: 'Установить фиксированную ставку',
          icon: <DollarSign className="h-5 w-5" />,
          description: `Установить одинаковую ставку для ${selectedCount} вид(ов) работ`,
          fields: (
            <div>
              <Label htmlFor="fixedRate">Тариф</Label>
              <Input
                id="fixedRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Например, 500.00"
                value={formData.fixedRate}
                onChange={(e) => setFormData({...formData, fixedRate: e.target.value})}
              />
            </div>
          )
        }
      
      case 'change_department':
        return {
          title: 'Сменить отдел',
          icon: <Building2 className="h-5 w-5" />,
          description: `Переместить ${selectedCount} вид(ов) работ в другой отдел`,
          fields: (
            <div>
              <Label htmlFor="newDepartment">Новый отдел</Label>
              <Select value={formData.newDepartment} onValueChange={(value) => setFormData({...formData, newDepartment: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
      
      case 'delete_soft':
        return {
          title: 'Удалить виды работ',
          icon: <Trash2 className="h-5 w-5" />,
          description: `Вы уверены, что хотите удалить ${selectedCount} вид(ов) работ?`,
          fields: (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                Это действие нельзя отменить. Виды работ будут удалены из системы.
              </p>
            </div>
          )
        }
      
      default:
        return {
          title: 'Массовое действие',
          icon: null,
          description: 'Выполнить действие',
          fields: null
        }
    }
  }

  const config = getDialogConfig()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">{config.description}</p>
          
          {config.fields}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              variant={action === 'delete_soft' ? 'destructive' : 'default'}
            >
              {action === 'delete_soft' ? 'Удалить' : 'Применить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
