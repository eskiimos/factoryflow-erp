'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Employee {
  id?: string
  firstName: string
  lastName: string
  middleName?: string
  position: string
  email?: string
  phone?: string
  salary?: number
  departmentId?: string
  isActive: boolean
  hireDate?: string
  notes?: string
}

interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
}

interface EmployeeFormProps {
  employee?: Employee
  onSave: (employee: Employee) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function EmployeeForm({ employee, onSave, onCancel, isLoading = false }: EmployeeFormProps) {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState<Employee>({
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    email: '',
    phone: '',
    salary: undefined,
    departmentId: undefined,
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
    notes: '',
    ...employee
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      const result = await response.json()
      
      if (result.success) {
        setDepartments(result.data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Должность обязательна'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }

    if (formData.salary && formData.salary < 0) {
      newErrors.salary = 'Зарплата не может быть отрицательной'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving employee:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку сотрудников
        </Button>
        
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {employee ? 'Редактировать сотрудника' : 'Новый сотрудник'}
          </h1>
          {employee && (
            <Badge variant={employee.isActive ? 'default' : 'secondary'}>
              {employee.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Фамилия *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                  placeholder="Введите фамилию"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Имя *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                  placeholder="Введите имя"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="middleName" className="text-sm font-medium">
                  Отчество
                </Label>
                <Input
                  id="middleName"
                  value={formData.middleName || ''}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  placeholder="Введите отчество"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position" className="text-sm font-medium">
                  Должность *
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={errors.position ? 'border-red-500' : ''}
                  placeholder="Введите должность"
                />
                {errors.position && (
                  <p className="text-sm text-red-500 mt-1">{errors.position}</p>
                )}
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium">
                  Отдел
                </Label>
                <Select
                  value={formData.departmentId?.toString() || 'none'}
                  onValueChange={(value) => handleInputChange('departmentId', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без отдела</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="employee@company.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Телефон
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Трудовая информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary" className="text-sm font-medium">
                  Зарплата (₽)
                </Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.salary || ''}
                  onChange={(e) => handleInputChange('salary', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={errors.salary ? 'border-red-500' : ''}
                  placeholder="0"
                />
                {errors.salary && (
                  <p className="text-sm text-red-500 mt-1">{errors.salary}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hireDate" className="text-sm font-medium">
                  Дата найма
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate || ''}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Статус
                </Label>
                <Select
                  value={formData.isActive.toString()}
                  onValueChange={(value) => handleInputChange('isActive', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Активен</SelectItem>
                    <SelectItem value="false">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Примечания
              </Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Дополнительная информация о сотруднике..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={saving || isLoading}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={saving || isLoading}
            className="min-w-[120px]"
          >
            {saving || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
