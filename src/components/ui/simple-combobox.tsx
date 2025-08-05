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
  searchTerms?: string[]
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

export function SimpleCombobox({
  options,
  value,
  onChange,
  placeholder = "Выберите значение",
  emptyMessage = "Ничего не найдено",
  className,
  groupByCategory = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const { locale } = useLanguage()

  // Находим текущий выбранный элемент для отображения метки
  const selectedItem = options.find(option => option.value === value)
  
  // Фильтруем опции на основе поискового запроса
  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options;
    
    const normalizedInput = inputValue.toLowerCase().trim();
    return options.filter(option => {
      // Проверяем совпадение в значении
      if (option.value.toLowerCase().includes(normalizedInput)) return true;
      
      // Проверяем совпадение в метке
      if (option.label.toLowerCase().includes(normalizedInput)) return true;
      
      // Проверяем совпадение в поисковых терминах
      if (option.searchTerms?.some(term => 
        term.toLowerCase().includes(normalizedInput)
      )) return true;
      
      return false;
    });
  }, [inputValue, options]);

  // Группируем опции по категориям, если это нужно
  const categorizedOptions = React.useMemo(() => {
    if (!groupByCategory) return null;
    
    return filteredOptions.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
      const category = option.category || 'Другое';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    }, {});
  }, [filteredOptions, groupByCategory, locale]);

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
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Поиск ${placeholder.toLowerCase()}...`} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          
          {groupByCategory && categorizedOptions ? (
            // Группируем по категориям
            Object.entries(categorizedOptions).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
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
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
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
