'use client'

import { useState, useEffect } from 'react'
import { ArrowRightLeft, Calculator, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UnitSelector } from './unit-selector'
import { cn } from '@/lib/utils'

interface ConversionResult {
  originalValue: number
  convertedValue: number
  fromUnit: string
  toUnit: string
  formula: string
  conversionFactor: number
  type: string
}

interface UnitConverterProps {
  value?: number
  fromUnit?: string
  toUnit?: string
  onChange?: (result: ConversionResult | null) => void
  className?: string
  showFormula?: boolean
  allowUnitSwap?: boolean
  restrictToType?: string
}

export function UnitConverter({
  value: initialValue = 1,
  fromUnit: initialFromUnit = '',
  toUnit: initialToUnit = '',
  onChange,
  className,
  showFormula = true,
  allowUnitSwap = true,
  restrictToType
}: UnitConverterProps) {
  const [value, setValue] = useState<number>(initialValue)
  const [fromUnit, setFromUnit] = useState<string>(initialFromUnit)
  const [toUnit, setToUnit] = useState<string>(initialToUnit)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Выполняем конвертацию при изменении параметров
  useEffect(() => {
    if (value && fromUnit && toUnit) {
      convertUnits()
    } else {
      setResult(null)
      setError('')
    }
  }, [value, fromUnit, toUnit])

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    if (onChange) {
      onChange(result)
    }
  }, [result, onChange])

  const convertUnits = async () => {
    if (!value || !fromUnit || !toUnit) return

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/measurement-units/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value,
          fromUnit,
          toUnit
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Ошибка конвертации')
        setResult(null)
      }
    } catch (error) {
      console.error('Conversion error:', error)
      setError('Ошибка при выполнении конвертации')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const swapUnits = () => {
    if (!allowUnitSwap || !fromUnit || !toUnit) return
    
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (result) {
      setValue(result.convertedValue)
    }
  }

  const formatNumber = (num: number): string => {
    if (num === 0) return '0'
    if (Math.abs(num) >= 1000000) {
      return num.toExponential(3)
    }
    if (Math.abs(num) < 0.001) {
      return num.toExponential(3)
    }
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 6 })
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Конвертер единиц измерения
        </CardTitle>
        <CardDescription>
          Конвертация между различными единицами измерения
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Поле ввода значения */}
        <div className="space-y-2">
          <Label htmlFor="value">Значение</Label>
          <Input
            id="value"
            type="number"
            value={value || ''}
            onChange={(e) => setValue(Number(e.target.value) || 0)}
            placeholder="Введите значение"
            step="any"
          />
        </div>

        {/* Выбор исходной единицы */}
        <div className="space-y-2">
          <Label>Из единицы</Label>
          <UnitSelector
            value={fromUnit}
            onChange={setFromUnit}
            type={restrictToType as any}
            placeholder="Выберите исходную единицу"
            showConversion={true}
          />
        </div>

        {/* Кнопка смены местами */}
        {allowUnitSwap && fromUnit && toUnit && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapUnits}
              className="h-8 w-8 p-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Выбор целевой единицы */}
        <div className="space-y-2">
          <Label>В единицу</Label>
          <UnitSelector
            value={toUnit}
            onChange={setToUnit}
            type={restrictToType as any}
            placeholder="Выберите целевую единицу"
            showConversion={true}
          />
        </div>

        {/* Результат конвертации */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && !loading && !error && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Результат:</span>
              <Badge variant="secondary">{result.type}</Badge>
            </div>
            
            <div className="text-2xl font-bold text-center">
              {formatNumber(result.convertedValue)} {result.toUnit}
            </div>
            
            {showFormula && (
              <div className="text-sm text-muted-foreground text-center">
                {result.formula}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Коэффициент:</span>
                <div className="font-medium">
                  {result.conversionFactor.toExponential(3)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Точность:</span>
                <div className="font-medium">
                  {Math.abs(result.convertedValue) < 0.001 ? 'Высокая' : 'Стандартная'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Подсказка */}
        {!fromUnit || !toUnit ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Выберите исходную и целевую единицы измерения для начала конвертации
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
