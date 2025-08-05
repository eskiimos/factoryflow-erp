'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface Employee {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  position: string
  skillLevel: string
  departmentId: string
  department?: {
    id: string
    name: string
  }
}

interface WorkType {
  id: string
  name: string
  description?: string
  unit: string
  standardTime: number
  hourlyRate: number
  currency: string
  skillLevel: string
  department?: {
    id: string
    name: string
  }
}

interface AddWorkTypeDialogProps {
  productId?: string
  onWorkTypeAdded?: () => void
  onAdd?: (workType: { 
    workTypeId: string
    quantity: number
    executorId?: string
    workType: WorkType
    executor?: Employee
  }) => void
}

export function AddWorkTypeDialog({ productId, onWorkTypeAdded, onAdd }: AddWorkTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [filteredWorkTypes, setFilteredWorkTypes] = useState<WorkType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [executorSearchTerm, setExecutorSearchTerm] = useState('')
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null)
  const [selectedExecutor, setSelectedExecutor] = useState<Employee | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()

  // Загружаем виды работ и сотрудников при открытии диалога
  useEffect(() => {
    if (open) {
      loadWorkTypes()
      loadEmployees()
    }
  }, [open])

  // Фильтрация видов работ по поисковому запросу
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWorkTypes(workTypes)
    } else {
      const filtered = workTypes.filter(workType => 
        workType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workType.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workType.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workType.skillLevel.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredWorkTypes(filtered)
    }
  }, [searchTerm, workTypes])

  // Фильтрация сотрудников по поисковому запросу и выбранному типу работы
  useEffect(() => {
    if (employees.length > 0) {
      let filtered = employees
      
      // Фильтрация по поисковому запросу
      if (executorSearchTerm) {
        filtered = filtered.filter(employee =>
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(executorSearchTerm.toLowerCase()) ||
          employee.position.toLowerCase().includes(executorSearchTerm.toLowerCase()) ||
          employee.department?.name.toLowerCase().includes(executorSearchTerm.toLowerCase())
        )
      }
      
      // Фильтрация по отделу выбранного типа работы
      if (selectedWorkType?.department) {
        filtered = filtered.filter(employee => 
          employee.departmentId === selectedWorkType.department?.id
        )
      }
      
      setFilteredEmployees(filtered)
    }
  }, [executorSearchTerm, employees, selectedWorkType])

  const loadWorkTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/work-types')
      if (response.ok) {
        const data = await response.json()
        setWorkTypes(data)
        setFilteredWorkTypes(data)
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка загрузки видов работ',
        })
      }
    } catch (error) {
      console.error('Error loading work types:', error)
      toast({
        variant: 'error',
        title: 'Ошибка загрузки видов работ',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const result = await response.json()
        const data = result.success ? result.data : result
        setEmployees(data)
        setFilteredEmployees(data)
      } else {
        toast({
          variant: 'error',
          title: 'Ошибка загрузки сотрудников',
        })
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      toast({
        variant: 'error',
        title: 'Ошибка загрузки сотрудников',
      })
    }
  }

  const handleAddWorkType = async () => {
    if (!selectedWorkType) return

    setAdding(true)
    try {
      if (productId) {
        // Режим редактирования - отправляем на сервер
        const response = await fetch(`/api/products/${productId}/work-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workTypeId: selectedWorkType.id,
            quantity: quantity
          })
        })

        if (response.ok) {
          toast({
            variant: 'success',
            title: 'Вид работы добавлен к товару'
          })
          onWorkTypeAdded?.()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Ошибка добавления вида работы')
        }
      } else if (onAdd) {
        // Режим создания - возвращаем данные родителю
        onAdd({
          workTypeId: selectedWorkType.id,
          quantity: quantity,
          executorId: selectedExecutor?.id,
          workType: selectedWorkType,
          executor: selectedExecutor || undefined
        })
        toast({
          variant: 'success',
          title: 'Вид работы добавлен'
        })
      }

      // Очистка формы
      setOpen(false)
      setSelectedWorkType(null)
      setSelectedExecutor(null)
      setQuantity(1)
      setSearchTerm('')
      setExecutorSearchTerm('')
    } catch (error: any) {
      console.error('Error adding work type:', error)
      toast({
        variant: 'error',
        title: 'Ошибка добавления вида работы',
        description: error.message
      })
    } finally {
      setAdding(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'рабочий': return 'bg-green-100 text-green-800'
      case 'специалист': return 'bg-blue-100 text-blue-800'
      case 'мастер': return 'bg-purple-100 text-purple-800'
      case 'инженер': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить работу
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить вид работы к товару</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск видов работ */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск видов работ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Список видов работ */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {filteredWorkTypes.map((workType) => (
                <Card 
                  key={workType.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedWorkType?.id === workType.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedWorkType(workType)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{workType.name}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {workType.description}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {workType.department?.name}
                          </Badge>
                          <Badge className={getSkillLevelColor(workType.skillLevel)}>
                            {workType.skillLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{workType.standardTime}ч стандарт</span>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(workType.hourlyRate)}/{workType.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Настройка количества */}
          {selectedWorkType && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Выбранная работа</Label>
                  <div className="text-sm font-medium">{selectedWorkType.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(selectedWorkType.hourlyRate)} за {selectedWorkType.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Стандартное время: {selectedWorkType.standardTime} ч
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Время ({selectedWorkType.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Рекомендуется: {selectedWorkType.standardTime} ч
                  </div>
                </div>
              </div>

              {/* Выбор исполнителя */}
              <div className="space-y-2">
                <Label>Исполнитель</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск исполнителя..."
                    value={executorSearchTerm}
                    onChange={(e) => setExecutorSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="grid gap-1 max-h-32 overflow-y-auto border rounded-md">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-2 cursor-pointer transition-colors text-sm ${
                        selectedExecutor?.id === employee.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedExecutor(employee)}
                    >
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {employee.position} • {employee.department?.name}
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Нет доступных исполнителей
                    </div>
                  )}
                </div>
                {selectedExecutor && (
                  <div className="text-xs text-muted-foreground">
                    Выбран: {selectedExecutor.firstName} {selectedExecutor.lastName} 
                    ({selectedExecutor.skillLevel})
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span>Общая стоимость:</span>
                <span className="font-bold">
                  {formatCurrency(selectedWorkType.hourlyRate * quantity)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Отменить
                </Button>
                <Button 
                  onClick={handleAddWorkType}
                  disabled={adding || !selectedExecutor}
                  className="flex-1"
                >
                  {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Добавить работу
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
