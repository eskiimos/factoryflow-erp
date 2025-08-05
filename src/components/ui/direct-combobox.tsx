"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"

export interface ComboboxOption {
  value: string
  label: string
  category?: string
  searchTerms?: string[]
}

interface DirectComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  groupByCategory?: boolean
}

export function DirectCombobox({
  options,
  value,
  onChange,
  placeholder = "Выберите значение",
  emptyMessage = "Ничего не найдено",
  className,
  groupByCategory = false
}: DirectComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const { locale } = useLanguage()
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Находим текущий выбранный элемент
  const selectedItem = options.find(option => option.value === value)

  // Фильтруем опции
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return options.filter(option => {
      // Проверяем значение
      if (option.value.toLowerCase().includes(normalizedSearch)) return true;
      
      // Проверяем метку
      if (option.label.toLowerCase().includes(normalizedSearch)) return true;
      
      // Проверяем поисковые термины
      if (option.searchTerms?.some(term => 
        term.toLowerCase().includes(normalizedSearch)
      )) return true;
      
      return false;
    });
  }, [searchTerm, options]);

  // Группируем опции по категориям, если нужно
  const categorizedOptions = React.useMemo(() => {
    if (!groupByCategory) return null;
    
    // Определяем порядок категорий (только русский)
    const categoryOrder = ["Вес", "Объем", "Длина", "Площадь", "Количество", "Электрические", "Время", "Другие"];
    
    // Создаем группы опций
    const groups = filteredOptions.reduce<Record<string, ComboboxOption[]>>((acc, option) => {
      const category = option.category || 'Другие';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    }, {});
    
    // Сортируем группы по заданному порядку категорий
    const orderedGroups: Record<string, ComboboxOption[]> = {};
    categoryOrder.forEach(category => {
      if (groups[category]) {
        orderedGroups[category] = groups[category];
      }
    });
    
    // Добавляем оставшиеся категории, если такие есть
    Object.keys(groups).forEach(category => {
      if (!orderedGroups[category]) {
        orderedGroups[category] = groups[category];
      }
    });
    
    return orderedGroups;
  }, [filteredOptions, groupByCategory, locale]);

  // Закрываем выпадающий список при клике вне компонента
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Выбор элемента
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Кнопка-триггер */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-10 border border-input"
      >
        <span className={!selectedItem ? "text-muted-foreground" : ""}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Поисковое поле */}
          <div className="flex items-center border-b px-3">
            <input
              className="flex h-10 w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Список опций */}
          <div className="max-h-72 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                {emptyMessage}
              </div>
            ) : groupByCategory && categorizedOptions ? (
              // Сгруппированные опции
              Object.entries(categorizedOptions).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                    {category}
                  </div>
                  {items.map(option => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100",
                        value === option.value && "bg-gray-100"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <div className="mr-2 h-4 w-4">
                        {value === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Негруппированные опции
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100",
                    value === option.value && "bg-gray-100"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="mr-2 h-4 w-4">
                    {value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
