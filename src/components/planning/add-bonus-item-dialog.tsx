'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calculator, Percent } from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  department: {
    id: string
    name: string
  }
  position?: string
  hourlyRate?: number
}

interface AddBonusItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    name: string
    calculationType: 'fixed' | 'percentage' | 'performance'
    amount?: number
    percentage?: number
    employeeIds: string[]
    description?: string
  }) => Promise<void>
}

const calculationTypes = [
  { value: 'fixed', label: 'Фиксированная сумма', icon: Calculator },
  { value: 'percentage', label: 'Процент от зарплаты', icon: Percent },
  { value: 'performance', label: 'По результатам', icon: Users }
]

export function AddBonusItemDialog({ isOpen, onClose, onAdd }: AddBonusItemDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    calculationType: 'fixed' as 'fixed' | 'percentage' | 'performance',
    amount: '',
    percentage: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Загружаем сотрудников
  useEffect(() => {
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const result = await response.json()
        // API возвращает { success: true, data: employees }
        const data = result.success ? result.data : result
        setEmployees(Array.isArray(data) ? data : [])
      } else {
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    const employeesList = employees || []
    if (selectedEmployeeIds.length === employeesList.length) {
      setSelectedEmployeeIds([])
    } else {
      setSelectedEmployeeIds(employeesList.map(emp => emp.id))
    }
  }

  const calculateTotalAmount = () => {
    if (formData.calculationType === 'fixed' && formData.amount) {
      return parseFloat(formData.amount) * selectedEmployeeIds.length
    }
    if (formData.calculationType === 'percentage' && formData.percentage) {
      const selectedEmployees = (employees || []).filter(emp => selectedEmployeeIds.includes(emp.id))
      return selectedEmployees.reduce((total, emp) => {
        if (emp.hourlyRate) {
          // Приблизительная месячная зарплата (160 часов в месяц)
          const monthlySalary = emp.hourlyRate * 160
          return total + (monthlySalary * parseFloat(formData.percentage) / 100)
        }
        return total
      }, 0)
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmployeeIds.length === 0) {
      alert('Выберите хотя бы одного сотрудника')
      return
    }

    setIsSubmitting(true)
    try {
      await onAdd({
        name: formData.name,
        calculationType: formData.calculationType,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        percentage: formData.percentage ? parseFloat(formData.percentage) : undefined,
        employeeIds: selectedEmployeeIds,
        description: formData.description
      })
      
      // Сброс формы
      setFormData({
        name: '',
        calculationType: 'fixed',
        amount: '',
        percentage: '',
        description: ''
      })
      setSelectedEmployeeIds([])
      onClose()
    } catch (error) {
      console.error('Error adding bonus item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏆 Добавить премию
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Левая колонка - основная информация */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название премии *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Квартальная премия"
                  required
                />
              </div>

              <div>
                <Label>Тип расчета *</Label>
                <Select 
                  value={formData.calculationType} 
                  onValueChange={(value: 'fixed' | 'percentage' | 'performance') => 
                    setFormData(prev => ({ ...prev, calculationType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {calculationTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {formData.calculationType === 'fixed' && (
                <div>
                  <Label htmlFor="amount">Сумма на сотрудника (₽) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="10000"
                    required
                  />
                </div>
              )}

              {formData.calculationType === 'percentage' && (
                <div>
                  <Label htmlFor="percentage">Процент от зарплаты (%) *</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                    placeholder="15"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация"
                />
              </div>

              {/* Итоговая сумма */}
              {selectedEmployeeIds.length > 0 && (formData.amount || formData.percentage) && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Предварительная сумма</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {calculateTotalAmount().toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedEmployeeIds.length} сотрудник(ов)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Правая колонка - выбор сотрудников */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Сотрудники *</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedEmployeeIds.length} из {(employees || []).length}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedEmployeeIds.length === (employees || []).length ? 'Снять все' : 'Выбрать все'}
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-80 border rounded-lg p-3">
                <div className="space-y-2">
                  {(employees || []).map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                    >
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                      />
                      <label 
                        htmlFor={employee.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{employee.department.name}</span>
                          {employee.hourlyRate && (
                            <Badge variant="outline" className="text-xs">
                              {(employee.hourlyRate * 160).toLocaleString('ru-RU')} ₽/мес
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {(employees || []).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Сотрудники не найдены</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Добавление...' : 'Добавить премию'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
