'use client'

import React, { useState, useEffect } from 'react'
import EmployeesTable from '@/components/employees-table'
import EmployeeForm from '@/components/employee-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Employee {
  id: string
  personnelNumber: string
  firstName: string
  lastName: string
  middleName?: string
  position: string
  skillLevel: string
  hourlyRate: number
  currency: string
  email?: string
  phone?: string
  departmentId?: string
  department?: {
    id: string
    name: string
    description?: string
  }
  isActive: boolean
  hireDate: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
}

type View = 'list' | 'form' | 'view'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employees')
      const result = await response.json()
      
      if (result.success) {
        setEmployees(result.data)
      } else {
        console.error('Error fetching employees:', result.message)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateNew = () => {
    setSelectedEmployee(null)
    setCurrentView('form')
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setCurrentView('form')
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowViewDialog(true)
  }

  const handleDelete = async (employee: Employee) => {
    const fullName = [employee.lastName, employee.firstName, employee.middleName]
      .filter(Boolean)
      .join(' ')

    if (!confirm(`Вы уверены, что хотите удалить сотрудника "${fullName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchEmployees()
        alert(`Сотрудник "${fullName}" успешно удален`)
      } else {
        alert('Ошибка при удалении сотрудника: ' + result.message)
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Ошибка при удалении сотрудника')
    }
  }

  const handleSave = async (employeeData: any) => {
    try {
      const url = selectedEmployee 
        ? `/api/employees/${selectedEmployee.id}`
        : '/api/employees'
      
      const method = selectedEmployee ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchEmployees()
        setCurrentView('list')
        setSelectedEmployee(null)
      } else {
        throw new Error(result.message || 'Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Error saving employee:', error)
      throw error
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedEmployee(null)
  }

  const getFullName = (employee: Employee) => {
    return [employee.lastName, employee.firstName, employee.middleName]
      .filter(Boolean)
      .join(' ')
  }

  const formatSalary = (hourlyRate?: number) => {
    if (!hourlyRate) return 'Не указана'
    const monthlySalary = hourlyRate * 160 // Примерный расчет месячной зарплаты
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(monthlySalary)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указана'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  if (currentView === 'form') {
    return (
      <EmployeeForm
        employee={selectedEmployee || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Сотрудники</h1>
        <p className="text-gray-600">Управление персоналом компании</p>
      </div>

      <EmployeesTable
        employees={employees}
        departments={departments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreateNew={handleCreateNew}
        isLoading={loading}
      />

      {/* Диалог просмотра сотрудника */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee && getFullName(selectedEmployee)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Основная информация</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Должность:</strong> {selectedEmployee.position}</div>
                  {selectedEmployee.department && (
                    <div><strong>Отдел:</strong> {selectedEmployee.department.name}</div>
                  )}
                  <div className="flex items-center">
                    <strong>Статус:</strong>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedEmployee.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEmployee.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Контактная информация</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {selectedEmployee.email || 'Не указан'}</div>
                  <div><strong>Телефон:</strong> {selectedEmployee.phone || 'Не указан'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Трудовая информация</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Зарплата:</strong> {formatSalary(selectedEmployee.hourlyRate)}</div>
                  <div><strong>Дата найма:</strong> {formatDate(selectedEmployee.hireDate)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Системная информация</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Создан:</strong> {formatDate(selectedEmployee.createdAt)}</div>
                  <div><strong>Обновлен:</strong> {formatDate(selectedEmployee.updatedAt)}</div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Закрыть
                </Button>
                <Button onClick={() => {
                  setShowViewDialog(false)
                  handleEdit(selectedEmployee)
                }}>
                  Редактировать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
