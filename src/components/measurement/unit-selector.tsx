'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface MeasurementUnit {
  id: string
  name: string
  symbol: string
  type: string
  baseUnit: string
  conversionFactor: number
  isActive: boolean
}

interface UnitSelectorProps {
  value?: string
  onChange: (value: string) => void
  type?: 'length' | 'area' | 'volume' | 'weight' | 'count' | 'all'
  label?: string
  placeholder?: string
  showConversion?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

const typeLabels: Record<string, string> = {
  length: 'Длина',
  area: 'Площадь',
  volume: 'Объем',
  weight: 'Вес',
  count: 'Количество'
}

const typeColors: Record<string, string> = {
  length: 'bg-blue-100 text-blue-800',
  area: 'bg-green-100 text-green-800',
  volume: 'bg-purple-100 text-purple-800',
  weight: 'bg-orange-100 text-orange-800',
  count: 'bg-gray-100 text-gray-800'
}

export function UnitSelector({
  value,
  onChange,
  type = 'all',
  label,
  placeholder = 'Выберите единицу измерения',
  showConversion = false,
  disabled = false,
  className,
  size = 'default'
}: UnitSelectorProps) {
  const [open, setOpen] = useState(false)
  const [units, setUnits] = useState<Record<string, MeasurementUnit[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  // Загружаем единицы измерения
  useEffect(() => {
    fetchUnits()
  }, [type])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (type !== 'all') {
        params.set('type', type)
      }
      params.set('groupBy', 'type')

      const response = await fetch(`/api/measurement-units?${params}`)
      if (response.ok) {
        const result = await response.json()
        setUnits(result.data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  // Находим выбранную единицу
  const selectedUnit = Object.values(units)
    .flat()
    .find(unit => unit.symbol === value || unit.name === value)

  // Фильтруем единицы по поиску
  const filteredUnits = Object.entries(units).reduce((acc, [unitType, typeUnits]) => {
    const filtered = typeUnits.filter(unit =>
      unit.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchValue.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[unitType] = filtered
    }
    return acc
  }, {} as Record<string, MeasurementUnit[]>)

  const buttonSizeClasses = {
    sm: 'h-8 px-2 text-xs',
    default: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              'w-full justify-between font-normal',
              buttonSizeClasses[size],
              !selectedUnit && 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              {selectedUnit ? (
                <>
                  <span className="font-medium">{selectedUnit.symbol}</span>
                  <span className="text-muted-foreground">— {selectedUnit.name}</span>
                  {showConversion && selectedUnit.conversionFactor !== 1 && (
                    <Badge variant="secondary" className="text-xs">
                      ×{selectedUnit.conversionFactor}
                    </Badge>
                  )}
                </>
              ) : (
                <span>{loading ? 'Загрузка...' : placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Поиск единиц измерения..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>
              Единицы измерения не найдены.
            </CommandEmpty>
            
            {Object.entries(filteredUnits).map(([unitType, typeUnits]) => (
              <CommandGroup 
                key={unitType}
                heading={
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={cn('text-xs', typeColors[unitType])}
                    >
                      {typeLabels[unitType] || unitType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({typeUnits.length})
                    </span>
                  </div>
                }
              >
                {typeUnits.map((unit) => (
                  <CommandItem
                    key={unit.id}
                    value={`${unit.name} ${unit.symbol}`}
                    onSelect={() => {
                      onChange(unit.symbol)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          'h-4 w-4',
                          selectedUnit?.id === unit.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{unit.symbol}</span>
                          <span className="text-sm text-muted-foreground">
                            {unit.name}
                          </span>
                        </div>
                        {showConversion && unit.conversionFactor !== 1 && (
                          <span className="text-xs text-muted-foreground">
                            1 {unit.symbol} = {unit.conversionFactor} {unit.baseUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
