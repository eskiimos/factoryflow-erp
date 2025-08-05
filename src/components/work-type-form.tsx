"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/context/language-context"
import { WorkTypeWithDepartment, Department, SkillLevel, WORK_UNITS } from "@/lib/types"
import { Building2, DollarSign, Clock, User, FileText } from "lucide-react"

export interface WorkTypeFormProps {
  isOpen: boolean
  onClose: () => void
  workType?: WorkTypeWithDepartment
  title: string
  onSubmit: (data: any) => Promise<void>
}

export function WorkTypeForm({ isOpen, onClose, workType, title, onSubmit }: WorkTypeFormProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    unit: "",
    rate: "",
    currency: "RUB",
    skillLevel: SkillLevel.TRAINEE,
    executorId: "none",
    estimatedTime: "",
    isActive: true
  })

  // Load departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Initialize form when workType changes
  useEffect(() => {
    if (workType && isOpen) {
      setFormData({
        name: workType.name || "",
        description: workType.description || "",
        departmentId: workType.departmentId || "",
        unit: workType.unit || "",
        rate: workType.hourlyRate?.toString() || "",
        currency: workType.currency || "RUB",
        skillLevel: workType.skillLevel as SkillLevel || SkillLevel.TRAINEE,
        executorId: "none",
        estimatedTime: workType.standardTime?.toString() || "",
        isActive: workType.isActive !== undefined ? workType.isActive : true
      })
      
      // Загружаем сотрудников из отдела, если есть данные
      if (workType.department?.employees) {
        setEmployees(workType.department.employees)
      }
    } else if (isOpen) {
      // Reset form for new work type
      setFormData({
        name: "",
        description: "",
        departmentId: "",
        unit: "",
        rate: "",
        currency: "RUB",
        skillLevel: SkillLevel.TRAINEE,
        executorId: "none",
        estimatedTime: "",
        isActive: true
      })
    }
  }, [workType, isOpen])

  // Load employees when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchEmployees(formData.departmentId)
    } else {
      setEmployees([])
    }
  }, [formData.departmentId])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      const result = await response.json()
      if (result.success) {
        setDepartments(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchEmployees = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/employees`)
      const result = await response.json()
      if (result.success) {
        setEmployees(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setEmployees([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        variant: "error",
        title: "Ошибка валидации",
        description: "Название вида работы обязательно для заполнения"
      })
      return
    }

    if (!formData.departmentId) {
      toast({
        variant: "error",
        title: "Ошибка валидации",
        description: "Выберите отдел"
      })
      return
    }

    if (!formData.unit) {
      toast({
        variant: "error",
        title: "Ошибка валидации",
        description: "Выберите единицу измерения"
      })
      return
    }

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      toast({
        variant: "error",
        title: "Ошибка валидации",
        description: "Укажите корректный тариф"
      })
      return
    }

    setLoading(true)
    
    try {    const submitData = {
      ...formData,
      hourlyRate: parseFloat(formData.rate),
      standardTime: formData.estimatedTime ? parseFloat(formData.estimatedTime) : null
    }
      
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
      // Error handling is done in parent component
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // Обрабатываем специальное значение "none" для опциональных полей
    let processedValue = value;
    if (value === "none") {
      processedValue = "";
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  const skillLevelOptions = [
    { value: SkillLevel.TRAINEE, label: "Стажер" },
    { value: SkillLevel.WORKER, label: "Рабочий" },
    { value: SkillLevel.SPECIALIST, label: "Специалист" },
    { value: SkillLevel.EXPERT, label: "Эксперт" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Название вида работы *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Например, Сварочные работы"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                placeholder="Подробное описание вида работы"
                rows={3}
              />
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="departmentId">Отдел *</Label>
              <Select value={formData.departmentId} onValueChange={(value) => handleInputChange("departmentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {formData.departmentId && departments.find(d => d.id === formData.departmentId)?.name}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {dept.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit */}
            <div>
              <Label htmlFor="unit">Единица измерения *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate */}
            <div>
              <Label htmlFor="rate">Тариф *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => handleInputChange("rate", e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <Label htmlFor="currency">Валюта</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">₽ Рубли</SelectItem>
                  <SelectItem value="USD">$ Доллары</SelectItem>
                  <SelectItem value="EUR">€ Евро</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Исполнитель */}
            <div>
              <Label htmlFor="executorId">Исполнитель</Label>
              <Select value={formData.executorId} onValueChange={(value) => handleInputChange("executorId", value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {formData.executorId && formData.executorId !== "none" ? 
                        employees.find(emp => emp.id === formData.executorId)?.firstName + ' ' + 
                        employees.find(emp => emp.id === formData.executorId)?.lastName 
                        : "Выберите исполнителя"
                      }
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Не назначен
                    </div>
                  </SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {employee.firstName} {employee.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Time */}
            <div>
              <Label htmlFor="estimatedTime">Время выполнения (мин)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimatedTime"
                  type="number"
                  min="0"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                  placeholder="60"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Активен</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
