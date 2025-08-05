'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MeasurementUnit {
  id: string
  name: string
  symbol: string
  type: string
  baseUnit: string
  conversionFactor: number
}

interface BaseUnitSelectorProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

const unitTypeLabels = {
  length: 'Длина',
  area: 'Площадь', 
  volume: 'Объем',
  weight: 'Вес',
  count: 'Количество'
}

const unitTypeDescriptions = {
  length: 'Для товаров измеряемых в длину (трубы, профили, провода)',
  area: 'Для товаров измеряемых по площади (листовой материал, ткани)',
  volume: 'Для товаров измеряемых по объему (жидкости, сыпучие материалы)',
  weight: 'Для товаров измеряемых по весу (металлы, химикаты)',
  count: 'Для штучных товаров (изделия, комплекты, упаковки)'
}

export function BaseUnitSelector({ value, onChange, className, disabled }: BaseUnitSelectorProps) {
  const [open, setOpen] = useState(false)
  const [units, setUnits] = useState<Record<string, MeasurementUnit[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit | null>(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    if (value && Object.keys(units).length > 0) {
      // Найти выбранную единицу
      for (const unitGroup of Object.values(units)) {
        const unit = unitGroup.find(u => u.symbol === value)
        if (unit) {
          setSelectedUnit(unit)
          break
        }
      }
    }
  }, [value, units])

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/measurement-units?groupBy=type')
      if (response.ok) {
        const data = await response.json()
        setUnits(data.data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUnit = (unit: MeasurementUnit) => {
    setSelectedUnit(unit)
    onChange(unit.symbol)
    setOpen(false)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Базовая единица калькуляции
          </CardTitle>
          <CardDescription>
            Загрузка единиц измерения...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Базовая единица калькуляции
        </CardTitle>
        <CardDescription>
          Выберите единицу измерения для расчета стоимости товара. 
          Все материалы, работы и накладные будут рассчитываться на 1 единицу.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              {selectedUnit ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedUnit.symbol}</Badge>
                  <span>{selectedUnit.name}</span>
                </div>
              ) : (
                "Выберите единицу измерения..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Поиск единиц измерения..." />
              <CommandEmpty>Единицы не найдены.</CommandEmpty>
              
              {Object.entries(units).map(([type, unitGroup]) => (
                <CommandGroup key={type} heading={unitTypeLabels[type as keyof typeof unitTypeLabels]}>
                  {unitGroup.map((unit) => (
                    <CommandItem
                      key={unit.id}
                      value={`${unit.name} ${unit.symbol}`}
                      onSelect={() => handleSelectUnit(unit)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedUnit?.id === unit.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{unit.symbol}</Badge>
                        <span>{unit.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </Command>
          </PopoverContent>
        </Popover>

        {selectedUnit && (
          <div className="rounded-lg bg-blue-50 p-3 border-l-4 border-blue-400">
            <div className="flex items-start gap-2">
              <Calculator className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Расчет будет вестись в: {selectedUnit.name} ({selectedUnit.symbol})
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {unitTypeDescriptions[selectedUnit.type as keyof typeof unitTypeDescriptions]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
