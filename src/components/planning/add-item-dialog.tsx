'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Save, X, HelpCircle, Check, ChevronsUpDown, Users, Building } from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  position: string
  hourlyRate: number
  currency: string
  department: {
    name: string
  }
}

interface AddItemDialogProps {
  categoryId: string
  fundId: string
  categoryName?: string
  categoryType?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddItemDialog({ categoryId, fundId, categoryName, categoryType, isOpen, onClose, onSuccess }: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    itemType: 'OTHER',
    amount: 0,
    currency: 'RUB',
    percentage: 0,
    description: '',
    employeeId: '',
    isRecurring: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [employeesError, setEmployeesError] = useState('')
  const [employeeComboboxOpen, setEmployeeComboboxOpen] = useState(false)
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  const [bulkMode, setBulkMode] = useState(false)

  // Проверяем, является ли категория зарплатной
  const isSalaryCategory = (categoryName && 
    (categoryName.toLowerCase().includes('зарплат') || 
     categoryName.toLowerCase().includes('оплат') ||
     categoryName.toLowerCase().includes('salary') ||
     categoryName.toLowerCase().includes('wage'))) ||
     (categoryType && categoryType.toLowerCase() === 'salary')

  // Загружаем сотрудников, если это зарплатная категория
  useEffect(() => {
    if (isSalaryCategory && isOpen) {
      loadEmployees()
    } else {
      // Сбрасываем всё связанное с сотрудниками если это не зарплатная категория
      setEmployees([])
      setEmployeesError('')
      setFormData(prev => ({ ...prev, employeeId: '' }))
    }
  }, [isSalaryCategory, isOpen])

  // Сбрасываем форму при закрытии диалога
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        itemType: 'OTHER',
        amount: 0,
        currency: 'RUB',
        percentage: 0,
        description: '',
        employeeId: '',
        isRecurring: false
      })
      setEmployees([])
      setEmployeesError('')
    }
  }, [isOpen])

  const loadEmployees = async () => {
    setLoadingEmployees(true)
    setEmployeesError('')
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const result = await response.json()
        console.log('Loaded employees:', result)
        
        // API возвращает { success: true, data: employees[] }
        const employees = result.success && Array.isArray(result.data) ? result.data : []
        setEmployees(employees)
        
        if (employees.length === 0) {
          setEmployeesError('Нет доступных сотрудников')
        }
      } else {
        console.error('Failed to load employees:', response.status, response.statusText)
        setEmployeesError(`Ошибка загрузки: ${response.status}`)
        setEmployees([])
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error)
      setEmployeesError('Ошибка соединения с сервером')
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  // Функции для массового выбора
  const handleSelectAll = () => {
    const allEmployeeIds = filteredEmployees.map(emp => emp.id)
    setSelectedEmployees(allEmployeeIds)
  }

  const handleDeselectAll = () => {
    setSelectedEmployees([])
  }

  const handleSelectByDepartment = (departmentName: string) => {
    const departmentEmployees = filteredEmployees
      .filter(emp => emp.department?.name === departmentName)
      .map(emp => emp.id)
    setSelectedEmployees(prev => [...new Set([...prev, ...departmentEmployees])])
  }

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Получаем уникальные отделы
  const uniqueDepartments = Array.from(
    new Set(employees.map(emp => emp.department?.name).filter(Boolean))
  ).map(name => ({ name }))

  // Закрытие выпадающего списка при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeComboboxOpen) {
        const target = event.target as Element
        if (!target.closest('.employee-dropdown')) {
          setEmployeeComboboxOpen(false)
          setEmployeeSearchQuery('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [employeeComboboxOpen])

  // Функция для фильтрации сотрудников по поисковому запросу
  const filteredEmployees = employees.filter(employee => {
    if (!employeeSearchQuery) return true
    const searchLower = employeeSearchQuery.toLowerCase()
    return (
      employee.firstName.toLowerCase().includes(searchLower) ||
      employee.lastName.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      (employee.middleName && employee.middleName.toLowerCase().includes(searchLower))
    )
  })

  // Обработчик выбора сотрудника
  const handleEmployeeSelect = (employeeId: string) => {
    if (!employees || employees.length === 0) return
    
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        name: `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim(),
        itemType: 'SALARY',
        amount: employee.hourlyRate * 160, // Примерно 160 часов в месяц
        currency: employee.currency,
        description: `Зарплата - ${employee.position}, ${employee.department.name}`
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (bulkMode && selectedEmployees.length > 0) {
        // Массовое создание элементов для выбранных сотрудников
        const promises = selectedEmployees.map(async (employeeId) => {
          const employee = employees.find(emp => emp.id === employeeId)
          if (!employee) return null

          const itemData = {
            name: `${employee.lastName} ${employee.firstName}`,
            itemType: 'SALARY',
            amount: employee.hourlyRate * 160, // Примерно 160 часов в месяц
            currency: employee.currency || 'RUB',
            percentage: 0,
            description: `Зарплата - ${employee.position}`,
            employeeId: employee.id,
            isRecurring: true,
            priority: 1
          }

          const response = await fetch(`/api/funds/${fundId}/categories/${categoryId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          })

          const result = await response.json()
          return { success: response.ok, data: result }
        })

        const results = await Promise.all(promises)
        const successful = results.filter(result => result?.success).length
        const failed = results.length - successful

        if (successful > 0) {
          alert(`Успешно добавлено ${successful} элементов${failed > 0 ? `, не удалось добавить ${failed}` : ''}`)
        } else {
          alert('Не удалось добавить ни одного элемента')
        }
      } else {
        // Обычное создание одного элемента
        console.log('Adding new item:', formData)
        
        const itemData = {
          ...formData,
          priority: 1
        }
        
        const response = await fetch(`/api/funds/${fundId}/categories/${categoryId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
        
        const result = await response.json()
        console.log('Add item response:', result)
        
        if (!response.ok) {
          console.error('Add item failed:', result)
          alert('Ошибка при добавлении элемента: ' + result.error)
          return
        }
      }

      // Reset form
      setFormData({
        name: '',
        itemType: 'OTHER',
        amount: 0,
        currency: 'RUB',
        percentage: 0,
        description: '',
        employeeId: '',
        isRecurring: false
      })
      setSelectedEmployees([])
      setBulkMode(false)
      setEmployees([])
      setEmployeesError('')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Ошибка при добавлении элемента')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Добавить новый элемент
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSalaryCategory && (
            <div className="space-y-3">
              {/* Переключатель режима */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={!bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkMode(false)}
                  className="flex items-center gap-1"
                >
                  <HelpCircle className="h-4 w-4" />
                  Один сотрудник
                </Button>
                <Button
                  type="button"
                  variant={bulkMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkMode(true)}
                  className="flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  Несколько сотрудников
                </Button>
              </div>

              {loadingEmployees ? (
                <div className="w-full p-3 border rounded-md text-sm text-gray-500 text-center">
                  Загрузка сотрудников...
                </div>
              ) : employees && employees.length > 0 ? (
                <div className="space-y-3">
                  {bulkMode ? (
                    // Режим массового выбора
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label>Массовый выбор сотрудников</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Выберите несколько сотрудников для автоматического создания элементов зарплаты</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Быстрые действия */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          Выбрать всех ({filteredEmployees.length})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAll}
                          className="flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Снять выделение
                        </Button>
                      </div>

                      {/* Выбор по отделам */}
                      {uniqueDepartments.length > 1 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-600">Выбрать по отделам:</Label>
                          <div className="flex flex-wrap gap-1">
                            {uniqueDepartments.map((dept) => (
                              <Button
                                key={dept.name}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectByDepartment(dept.name)}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Building className="h-3 w-3" />
                                {dept.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Поиск */}
                      <div>
                        <Input
                          placeholder="Поиск сотрудника..."
                          value={employeeSearchQuery}
                          onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                          className="h-8"
                        />
                      </div>

                      {/* Список сотрудников с чекбоксами */}
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        {filteredEmployees.length > 0 ? (
                          <div className="space-y-1 p-2">
                            {filteredEmployees.map((employee) => (
                              <div
                                key={employee.id}
                                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={selectedEmployees.includes(employee.id)}
                                  onCheckedChange={() => handleToggleEmployee(employee.id)}
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {employee.lastName} {employee.firstName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {employee.position} • {employee.department?.name}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {employee.hourlyRate * 160} ₽/мес
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            Сотрудники не найдены
                          </div>
                        )}
                      </div>

                      {selectedEmployees.length > 0 && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          Выбрано сотрудников: {selectedEmployees.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Режим выбора одного сотрудника
                    <div className="relative employee-dropdown">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="employee">Сотрудник</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Выберите сотрудника для автоматического заполнения данных о зарплате</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setEmployeeComboboxOpen(!employeeComboboxOpen)}
                      >
                        {formData.employeeId && employees.find((emp) => emp.id === formData.employeeId)
                          ? `${employees.find((emp) => emp.id === formData.employeeId)?.lastName} ${employees.find((emp) => emp.id === formData.employeeId)?.firstName} - ${employees.find((emp) => emp.id === formData.employeeId)?.position}`
                          : "Выберите сотрудника..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      
                      {employeeComboboxOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-hidden">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Поиск сотрудника..."
                              value={employeeSearchQuery}
                              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto">
                            {filteredEmployees.length > 0 ? (
                              filteredEmployees.map((employee) => (
                                <div
                                  key={employee.id}
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                                  onClick={() => {
                                    handleEmployeeSelect(employee.id)
                                    setEmployeeComboboxOpen(false)
                                    setEmployeeSearchQuery('')
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.employeeId === employee.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <span className="text-sm">
                                    {employee.lastName} {employee.firstName} - {employee.position}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                Сотрудник не найден
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full p-3 border rounded-md text-sm text-gray-500 text-center">
                  {employeesError || 'Нет доступных сотрудников'}
                </div>
              )}
              
              {employeesError && (
                <p className="text-sm text-red-500">{employeesError}</p>
              )}
            </div>
          )}

          {/* Поля формы показываются только в режиме одного сотрудника */}
          {!bulkMode && (
            <>
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Введите название элемента"
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="amount">Сумма</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Денежная сумма для данного элемента в рублях</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
            </>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || (bulkMode && selectedEmployees.length === 0) || (!bulkMode && !formData.name)}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {bulkMode ? 'Добавление...' : 'Сохранение...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {bulkMode ? `Добавить ${selectedEmployees.length} элементов` : 'Сохранить'}
                </div>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-1" />
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
