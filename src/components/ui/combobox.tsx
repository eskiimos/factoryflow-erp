"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLanguage } from "@/context/language-context"

export interface ComboboxOption {
  value: string
  label: string
  category?: string
  searchTerms?: string[] // Дополнительные поисковые термины на русском
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  groupByCategory?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage,
  className,
  groupByCategory = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { locale, t } = useLanguage()
  
  // Set defaults based on current language
  const defaultPlaceholder = "Выберите значение"
  const defaultEmptyMessage = "Ничего не найдено"
  
  // Use provided values or defaults
  const finalPlaceholder = placeholder || defaultPlaceholder
  const finalEmptyMessage = emptyMessage || defaultEmptyMessage
  
  // Находим текущий выбранный элемент для отображения метки
  const selectedItem = React.useMemo(() => {
    return options.find(option => option.value === value)
  }, [value, options])

  // Если нужна группировка по категориям, формируем объект с категориями
  const categorizedOptions = React.useMemo(() => {
    if (!groupByCategory) return null;
    
    return options.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
      const category = option.category || 'Другое';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    }, {});
  }, [options, groupByCategory]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10", 
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedItem ? selectedItem.label : finalPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command
          // Отключаем встроенную фильтрацию, будем делать её сами
          shouldFilter={false}
        >
          <CommandInput placeholder={`Поиск ${finalPlaceholder.toLowerCase()}...`} />
          <CommandEmpty>{finalEmptyMessage}</CommandEmpty>
          
          {groupByCategory && categorizedOptions ? (
            // Группируем по категориям
            Object.entries(categorizedOptions).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          ) : (
            // Без группировки
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
