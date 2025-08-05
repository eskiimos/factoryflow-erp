'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Plane, Car, Hotel, Utensils, Users } from "lucide-react"

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

interface ExpenseCategory {
  id: string
  name: string
  icon: any
  dailyRate?: number
  description: string
}

interface AddTravelItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: {
    name: string
    destination: string
    startDate: string
    endDate: string
    employeeIds: string[]
    expenses: {
      categoryId: string
      amount: number
      days?: number
    }[]
    totalAmount: number
    purpose?: string
    description?: string
  }) => Promise<void>
}

const expenseCategories: ExpenseCategory[] = [
  {
    id: 'transport',
    name: 'Транспорт',
    icon: Plane,
    description: 'Авиабилеты, ж/д билеты, такси'
  },
  {
    id: 'accommodation',
    name: 'Проживание',
    icon: Hotel,
    dailyRate: 3500,
    description: 'Гостиница, съемное жилье'
  },
  {
    id: 'meals',
    name: 'Питание',
    icon: Utensils,
    dailyRate: 2500,
    description: 'Суточные на питание'
  },
  {
    id: 'local_transport',
    name: 'Местный транспорт',
    icon: Car,
    dailyRate: 1000,
    description: 'Такси, общественный транспорт'
  },
  {
    id: 'communication',
    name: 'Связь',
    icon: MapPin,
    dailyRate: 500,
    description: 'Мобильная связь, интернет'
  }
]

export function AddTravelItemDialog({ isOpen, onClose, onAdd }: AddTravelItemDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [selectedExpenses, setSelectedExpenses] = useState<{[key: string]: number}>({})
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    purpose: '',
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

  const handleSelectAllEmployees = () => {
    const employeesList = employees || []
    if (selectedEmployeeIds.length === employeesList.length) {
      setSelectedEmployeeIds([])
    } else {
      setSelectedEmployeeIds(employeesList.map(emp => emp.id))
    }
  }

  const handleExpenseChange = (categoryId: string, amount: number) => {
    setSelectedExpenses(prev => ({
      ...prev,
      [categoryId]: amount
    }))
  }

  const getDaysCount = () => {
    if (!formData.startDate || !formData.endDate) return 1
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const calculateAutoAmount = (category: ExpenseCategory) => {
    if (!category.dailyRate) return 0
    const days = getDaysCount()
    const employees = selectedEmployeeIds.length || 1
    return category.dailyRate * days * employees
  }

  const getTotalAmount = () => {
    return Object.values(selectedExpenses).reduce((sum, amount) => sum + amount, 0)
  }

  const handleAutoCalculate = () => {
    const newExpenses: {[key: string]: number} = {}
    expenseCategories.forEach(category => {
      const autoAmount = calculateAutoAmount(category)
      if (autoAmount > 0) {
        newExpenses[category.id] = autoAmount
      }
    })
    setSelectedExpenses(newExpenses)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmployeeIds.length === 0) {
      alert('Выберите хотя бы одного сотрудника')
      return
    }
    if (Object.keys(selectedExpenses).length === 0) {
      alert('Укажите хотя бы одну статью расходов')
      return
    }

    setIsSubmitting(true)
    try {
      const days = getDaysCount()
      await onAdd({
        name: formData.name || `Командировка в ${formData.destination}`,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        employeeIds: selectedEmployeeIds,
        expenses: Object.entries(selectedExpenses).map(([categoryId, amount]) => ({
          categoryId,
          amount,
          days: expenseCategories.find(c => c.id === categoryId)?.dailyRate ? days : undefined
        })),
        totalAmount: getTotalAmount(),
        purpose: formData.purpose,
        description: formData.description
      })
      
      // Сброс формы
      setFormData({
        name: '',
        destination: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        purpose: '',
        description: ''
      })
      setSelectedEmployeeIds([])
      setSelectedExpenses({})
      onClose()
    } catch (error) {
      console.error('Error adding travel item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✈️ Добавить командировку
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[75vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Основная информация</TabsTrigger>
                <TabsTrigger value="employees">Сотрудники</TabsTrigger>
                <TabsTrigger value="expenses">Расходы</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Название командировки</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Автоматически из места назначения"
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Место назначения *</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Например: Санкт-Петербург"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Дата начала *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Дата окончания *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose">Цель командировки</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                      placeholder="Например: Участие в выставке"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Дополнительная информация"
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>Продолжительность: {getDaysCount()} дн.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>Направление: {formData.destination || 'Не указано'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="employees" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Участники командировки *</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedEmployeeIds.length} из {(employees || []).length}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllEmployees}
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
                          <div className="text-sm text-gray-500">{employee.department.name}</div>
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
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Статьи расходов *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoCalculate}
                    disabled={selectedEmployeeIds.length === 0 || getDaysCount() === 0}
                  >
                    Автоматический расчет
                  </Button>
                </div>

                <div className="max-h-64 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expenseCategories.map((category) => {
                      const Icon = category.icon
                      const autoAmount = calculateAutoAmount(category)
                      
                      return (
                        <Card key={category.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Icon className="w-5 h-5" />
                                <div>
                                  <div className="font-medium">{category.name}</div>
                                  <div className="text-sm text-gray-500">{category.description}</div>
                                </div>
                              </div>

                              {category.dailyRate && (
                                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                  Норматив: {category.dailyRate.toLocaleString('ru-RU')} ₽/день
                                  {autoAmount > 0 && (
                                    <div className="mt-1">
                                      {selectedEmployeeIds.length} чел. × {getDaysCount()} дн. = {autoAmount.toLocaleString('ru-RU')} ₽
                                    </div>
                                  )}
                                </div>
                              )}

                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={selectedExpenses[category.id] || ''}
                                onChange={(e) => handleExpenseChange(category.id, parseFloat(e.target.value) || 0)}
                                placeholder={autoAmount > 0 ? autoAmount.toString() : '0'}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {getTotalAmount() > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Общая стоимость командировки</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {getTotalAmount().toLocaleString('ru-RU')} ₽
                        </p>
                        {selectedEmployeeIds.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {selectedEmployeeIds.length} сотрудник(ов) × {getDaysCount()} дн.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>

        <div className="flex justify-end space-x-3 pt-4 border-t bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={(e) => {
              // Проверяем обязательные поля
              if (selectedEmployeeIds.length === 0) {
                e.preventDefault()
                alert('Выберите хотя бы одного сотрудника')
                return
              }
              if (Object.keys(selectedExpenses).length === 0) {
                e.preventDefault()
                alert('Укажите хотя бы одну статью расходов')
                return
              }
            }}
          >
            {isSubmitting ? 'Добавление...' : 'Добавить командировку'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
