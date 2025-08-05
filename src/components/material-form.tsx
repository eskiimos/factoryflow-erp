"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { MaterialCombobox } from "@/components/material-combobox"
import { Category } from "@/lib/types"
import { UNITS_OF_MEASUREMENT, CURRENCIES, UNIT_CATEGORIES } from "@/lib/constants"
import { useLanguage } from "@/context/language-context"

interface MaterialFormData {
  name: string
  unit: string
  price: number
  currency: string
  categoryId: string
  tags?: string[]
  
  // Управление запасами
  currentStock: number
  criticalMinimum: number
  satisfactoryLevel: number
  
  _isCopy?: boolean // Флаг для обозначения копируемого материала
}

interface MaterialFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MaterialFormData) => Promise<void>
  material?: any
  title?: string
}

export function MaterialForm({
  isOpen,
  onClose,
  onSubmit,
  material,
  title
}: MaterialFormProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    unit: "",
    price: 0,
    currency: "RUB",
    categoryId: "",
    currentStock: 0,
    criticalMinimum: 0,
    satisfactoryLevel: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (material) {
        // Проверяем, является ли материал копией
        const isCopy = material._isCopy;
        
        setFormData({
          name: material.name,
          unit: material.unit,
          price: material.price,
          currency: material.currency,
          categoryId: material.categoryId,
          currentStock: material.currentStock || 0,
          criticalMinimum: material.criticalMinimum || 0,
          satisfactoryLevel: material.satisfactoryLevel || 0,
          // Если материал является копией, не сохраняем его ID
          // это заставит форму создать новый материал вместо обновления существующего
          ...(isCopy && { _isCopy: true }),
        })
      } else {
        setFormData({
          name: "",
          unit: "",
          price: 0,
          currency: "RUB",
          categoryId: "",
          currentStock: 0,
          criticalMinimum: 0,
          satisfactoryLevel: 0,
        })
      }
      setErrors({})
    }
  }, [isOpen, material])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const { data } = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) {
      newErrors.name = t.materialForm.validation.nameRequired
    }
    
    if (!formData.unit) {
      newErrors.unit = t.materialForm.validation.unitRequired
    }
    
    if (formData.price < 0) {
      newErrors.price = t.materialForm.validation.pricePositive
    }
    
    // Категория больше не является обязательным полем
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      onClose()
      setFormData({
        name: "",
        unit: "",
        price: 0,
        currency: "RUB",
        categoryId: "",
        currentStock: 0,
        criticalMinimum: 0,
        satisfactoryLevel: 0,
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50%] max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title || (material ? t.materialForm.editTitle : t.materialForm.addTitle)}</DialogTitle>
          <DialogDescription>
            {material ? t.materialForm.editDescription : t.materialForm.addDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.materialForm.fields.name}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t.materialForm.fields.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">{t.materialForm.fields.unit}</Label>
              <MaterialCombobox
                type="unit"
                value={formData.unit}
                onChange={(value) => {
                  setFormData({...formData, unit: value});
                  if (errors.unit) {
                    setErrors(prev => ({ ...prev, unit: '' }));
                  }
                }}
                error={errors.unit}
                groupByCategory={true}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t.materialForm.fields.currency}</Label>
              <MaterialCombobox
                type="currency"
                value={formData.currency}
                onChange={(value) => {
                  setFormData({...formData, currency: value});
                  if (errors.currency) {
                    setErrors(prev => ({ ...prev, currency: '' }));
                  }
                }}
                error={errors.currency}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">{t.materialForm.fields.price}</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder={t.materialForm.fields.pricePlaceholder}
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="categoryId">{t.materialForm.fields.category}</Label>
              <span className="text-sm text-gray-500">{t.materialForm.fields.optional}</span>
            </div>
            <MaterialCombobox
              type="category"
              options={categories.map(category => ({
                value: category.id,
                label: category.name
              }))}
              value={formData.categoryId}
              onChange={(value) => {
                setFormData({...formData, categoryId: value})
                if (errors.categoryId) {
                  setErrors(prev => ({ ...prev, categoryId: '' }))
                }
              }}
              error={errors.categoryId}
              allowEmpty={true}
            />
          </div>

          {/* Управление запасами */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{t.inventory.title}</h3>
              <p className="text-sm text-gray-600">Установите уровни запасов для контроля остатков</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">{t.materialForm.fields.currentStock}</Label>
                <Input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t.materialForm.fields.currentStockPlaceholder}
                  value={formData.currentStock}
                  onChange={handleChange}
                  className={errors.currentStock ? "border-red-500" : ""}
                />
                {errors.currentStock && (
                  <p className="text-sm text-red-600">{errors.currentStock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticalMinimum">{t.materialForm.fields.criticalMinimum}</Label>
                <Input
                  id="criticalMinimum"
                  name="criticalMinimum"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t.materialForm.fields.criticalMinimumPlaceholder}
                  value={formData.criticalMinimum}
                  onChange={handleChange}
                  className={errors.criticalMinimum ? "border-red-500" : ""}
                />
                {errors.criticalMinimum && (
                  <p className="text-sm text-red-600">{errors.criticalMinimum}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfactoryLevel">{t.materialForm.fields.satisfactoryLevel}</Label>
                <Input
                  id="satisfactoryLevel"
                  name="satisfactoryLevel"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t.materialForm.fields.satisfactoryLevelPlaceholder}
                  value={formData.satisfactoryLevel}
                  onChange={handleChange}
                  className={errors.satisfactoryLevel ? "border-red-500" : ""}
                />
                {errors.satisfactoryLevel && (
                  <p className="text-sm text-red-600">{errors.satisfactoryLevel}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t.materialForm.buttons.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.materialForm.buttons.saving}
                </span>
              ) : material ? t.materialForm.buttons.update : t.materialForm.buttons.add}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
