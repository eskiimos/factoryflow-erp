'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Building,
  UserPlus,
  Filter,
  Download,
  SortAsc,
  SortDesc
} from 'lucide-react'

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

interface EmployeesTableProps {
  employees: Employee[]
  departments: Department[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onView: (employee: Employee) => void
  onCreateNew: () => void
  isLoading?: boolean
}

type SortField = 'name' | 'position' | 'department' | 'salary' | 'hireDate'
type SortDirection = 'asc' | 'desc'

export default function EmployeesTable({ 
  employees, 
  departments, 
  onEdit, 
  onDelete, 
  onView, 
  onCreateNew,
  isLoading = false 
}: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Функция для получения полного имени
  const getFullName = (employee: Employee) => {
    const parts = [employee.lastName, employee.firstName, employee.middleName].filter(Boolean)
    return parts.join(' ')
  }

  // Фильтрация и сортировка
  const filteredAndSortedEmployees = React.useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        getFullName(employee).toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm)

      const matchesDepartment = departmentFilter === 'all' || 
        (departmentFilter === 'none' && !employee.departmentId) ||
        employee.departmentId?.toString() === departmentFilter

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && employee.isActive) ||
        (statusFilter === 'inactive' && !employee.isActive)

      return matchesSearch && matchesDepartment && matchesStatus
    })

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'name':
          aValue = getFullName(a).toLowerCase()
          bValue = getFullName(b).toLowerCase()
          break
        case 'position':
          aValue = a.position.toLowerCase()
          bValue = b.position.toLowerCase()
          break
        case 'department':
          aValue = a.department?.name?.toLowerCase() || ''
          bValue = b.department?.name?.toLowerCase() || ''
          break
        case 'salary':
          aValue = a.hourlyRate || 0
          bValue = b.hourlyRate || 0
          break
        case 'hireDate':
          aValue = new Date(a.hireDate || a.createdAt)
          bValue = new Date(b.hireDate || b.createdAt)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [employees, searchTerm, departmentFilter, statusFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4 ml-1" /> : 
      <SortDesc className="w-4 h-4 ml-1" />
  }

  const formatSalary = (hourlyRate?: number) => {
    if (!hourlyRate) return '—'
    const monthlySalary = hourlyRate * 160 // Примерный расчет месячной зарплаты
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(monthlySalary)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const exportToCSV = () => {
    const headers = ['Фамилия', 'Имя', 'Отчество', 'Должность', 'Отдел', 'Email', 'Телефон', 'Зарплата', 'Дата найма', 'Статус']
    const csvData = filteredAndSortedEmployees.map(emp => [
      emp.lastName,
      emp.firstName,
      emp.middleName || '',
      emp.position,
      emp.department?.name || '',
      emp.email || '',
      emp.phone || '',
      emp.hourlyRate || '',
      formatDate(emp.hireDate),
      emp.isActive ? 'Активен' : 'Неактивен'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { variant: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Активных</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Отделов</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Средняя зарплата</p>
                <p className="text-2xl font-bold">
                  {formatSalary(
                    employees.filter(e => e.hourlyRate && e.isActive)
                      .reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / 
                      employees.filter(e => e.hourlyRate && e.isActive).length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Панель управления */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Сотрудники ({filteredAndSortedEmployees.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button onClick={onCreateNew}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Фильтры */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по имени, должности, email или телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Отдел" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все отделы</SelectItem>
                <SelectItem value="none">Без отдела</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Таблица */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      ФИО
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center">
                      Должность
                      {getSortIcon('position')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      Отдел
                      {getSortIcon('department')}
                    </div>
                  </TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('salary')}
                  >
                    <div className="flex items-center">
                      Зарплата
                      {getSortIcon('salary')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('hireDate')}
                  >
                    <div className="flex items-center">
                      Дата найма
                      {getSortIcon('hireDate')}
                    </div>
                  </TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Загрузка...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' 
                        ? 'Сотрудники не найдены' 
                        : 'Нет сотрудников'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{getFullName(employee)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        {employee.department ? (
                          <Badge variant="outline">
                            {employee.department.name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {employee.email && (
                            <div className="text-sm">{employee.email}</div>
                          )}
                          {employee.phone && (
                            <div className="text-sm text-gray-600">{employee.phone}</div>
                          )}
                          {!employee.email && !employee.phone && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatSalary(employee.hourlyRate)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(employee.hireDate)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                          {employee.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(employee)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(employee)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
