"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Search, Filter, History, Tag, X, ArrowRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type SearchFilter = {
  id: string;
  variant: 'category' | 'unit' | 'price' | 'tag';
  value: string;
  label: string;
}

type SearchHistoryItem = {
  query: string;
  timestamp: number;
  filters: SearchFilter[];
}

interface EnhancedSearchProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (value: string, filters: SearchFilter[]) => void;
  debounceTime?: number;
  className?: string;
  disabled?: boolean;
  categories?: { id: string; name: string }[];
  units?: string[];
}

export function EnhancedSearch({
  placeholder,
  initialValue = "",
  onSearch,
  debounceTime = 300,
  className = "",
  disabled = false,
  categories = [],
  units = []
}: EnhancedSearchProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(initialValue);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Загружаем историю поиска из localStorage при первой загрузке
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  }, []);
  
  // Сохраняем историю поиска в localStorage при изменении
  useEffect(() => {
    try {
      // Хранить только последние 10 поисков
      const limitedHistory = searchHistory.slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  }, [searchHistory]);
  
  // Синхронизируем входящее значение с полем ввода
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Очищаем таймаут при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Обработчик изменений с debounce
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Обновляем значение поля ввода немедленно для отзывчивости UI
    setInputValue(value);
    
    // Показываем индикатор поиска сразу при вводе
    setSearching(true);
    
    // Подготавливаем поисковый запрос
    const trimmedValue = value.trim();
    
    // Live-поиск с задержкой
    searchTimeoutRef.current = setTimeout(() => {
      console.log("Live-searching for:", trimmedValue);
      
      // Добавляем в историю только если запрос не пустой
      if (trimmedValue) {
        addToSearchHistory(trimmedValue);
      }
      
      // Вызываем колбэк поиска с фильтрами
      onSearch(trimmedValue, filters);
      
      // Если поле полностью очищено, убираем индикатор поиска сразу
      if (!trimmedValue) {
        setSearching(false);
      }
    }, debounceTime);
  }, [onSearch, debounceTime, filters]);

  // Обработчик очистки поля
  const handleClear = useCallback(() => {
    setInputValue("");
    setFilters([]);
    onSearch("", []);
    
    // Возвращаем фокус на поле ввода
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onSearch]);
  
  // Добавляем запрос в историю поиска
  const addToSearchHistory = (query: string) => {
    // Не добавляем дубликаты или пустые запросы
    if (!query.trim() || searchHistory.some(item => item.query === query && arraysEqual(item.filters, filters))) {
      return;
    }
    
    setSearchHistory(prev => [{
      query,
      timestamp: Date.now(),
      filters: [...filters]
    }, ...prev].slice(0, 10)); // Ограничиваем до 10 элементов
  };
  
  // Хелпер для сравнения массивов фильтров
  const arraysEqual = (a: SearchFilter[], b: SearchFilter[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].value !== b[i].value) return false;
    }
    return true;
  };
  
  // Добавляем фильтр
  const addFilter = (filter: SearchFilter) => {
    // Не добавляем дубликаты
    if (filters.some(f => f.id === filter.id && f.value === filter.value)) {
      return;
    }
    
    setFilters(prev => [...prev, filter]);
    setIsFiltersOpen(false);
  };
  
  // Удаляем фильтр
  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };
  
  // Применяем исторический поиск
  const applyHistoryItem = (item: SearchHistoryItem) => {
    setInputValue(item.query);
    setFilters(item.filters);
    onSearch(item.query, item.filters);
    setIsCommandOpen(false);
  };
  
  // Форматируем дату для истории поиска
  const formatHistoryDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-2">
      <div className={cn("flex flex-wrap gap-2 items-center", className)}>
        <div className="relative flex-1">
          {disabled || searching ? (
            <div className="absolute left-3 top-2.5 w-4 h-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Search 
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 transition-colors hover:text-gray-600 cursor-pointer" 
              onClick={() => setIsCommandOpen(true)}
            />
          )}
          
          <input
            type="text"
            placeholder={placeholder || t?.materials?.searchPlaceholder || "Поиск..."}
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm",
              "hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-blue-100 transition-all disabled:cursor-not-allowed disabled:opacity-50",
              filters.length > 0 ? "rounded-r-none border-r-0" : ""
            )}
            ref={searchInputRef}
            disabled={disabled}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === '/') {
                e.preventDefault();
                setIsCommandOpen(true);
              }
            }}
          />
          
          {inputValue && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
              title={t?.materials?.search?.clear || "Очистить поиск"}
              type="button"
            >
              <X size={16} />
            </button>
          )}
          
          {showSuggestions && inputValue && !disabled && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 max-h-60 overflow-y-auto py-1">
              {/* Suggestions based on input */}
              {units.filter(unit => unit.toLowerCase().includes(inputValue.toLowerCase())).map((unit, i) => (
                <div
                  key={`unit-${i}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    setInputValue(unit);
                    handleSearchChange(unit);
                    setShowSuggestions(false);
                  }}
                >
                  <Tag size={14} className="mr-2 text-blue-500" />
                  <span>{unit}</span>
                </div>
              ))}
              
              {categories.filter(cat => cat.name.toLowerCase().includes(inputValue.toLowerCase())).map((cat) => (
                <div
                  key={`cat-${cat.id}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    addFilter({
                      id: cat.id,
                      variant: 'category',
                      value: cat.id,
                      label: cat.name
                    });
                    setShowSuggestions(false);
                  }}
                >
                  <Filter size={14} className="mr-2 text-green-500" />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {filters.length > 0 && (
          <div className="flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-2 py-1.5">
            <div className="flex items-center gap-1 overflow-x-auto max-w-xs no-scrollbar">
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="px-2 py-0.5 flex items-center gap-1 group"
                >
                  <span className="text-xs">{filter.label}</span>
                  <X
                    size={12}
                    className="cursor-pointer text-gray-400 group-hover:text-gray-700"
                    onClick={() => removeFilter(filter.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 shrink-0"
              disabled={disabled}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{t?.search?.filterBy || "Фильтровать по"}</h3>
              
              {/* Filter by Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500">{t?.materials?.category || "Категория"}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => addFilter({
                        id: `category-${category.id}`,
                        variant: 'category',
                        value: category.id,
                        label: category.name
                      })}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Filter by Unit */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500">{t?.materials?.unit || "Единица измерения"}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {units.slice(0, 6).map((unit, i) => (
                    <Button
                      key={`unit-${i}`}
                      variant="outline"
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => addFilter({
                        id: `unit-${unit}`,
                        variant: 'unit',
                        value: unit,
                        label: unit
                      })}
                    >
                      {unit}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Filter by Price Range */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500">{t?.materials?.price || "Цена"}</h4>
                <div className="grid grid-cols-2 gap-1">
                  {["0-1000", "1000-5000", "5000-10000", "10000+"].map((range, i) => (
                    <Button
                      key={`price-${i}`}
                      variant="outline"
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => addFilter({
                        id: `price-${range}`,
                        variant: 'price',
                        value: range,
                        label: `${t?.materials?.price || "Цена"}: ${range}`
                      })}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 shrink-0"
          onClick={() => setIsCommandOpen(true)}
          disabled={disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Активные фильтры - метки под поиском */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="px-2 py-0.5 flex items-center gap-1 group bg-blue-50"
            >
              {filter.type === 'category' && <Filter size={12} className="text-blue-500" />}
              {filter.type === 'unit' && <Tag size={12} className="text-green-500" />}
              {filter.type === 'price' && <span className="text-amber-500">₽</span>}
              <span className="text-xs">{filter.label}</span>
              <X
                size={12}
                className="cursor-pointer text-gray-400 group-hover:text-gray-700"
                onClick={() => removeFilter(filter.id)}
              />
            </Badge>
          ))}
          {filters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 text-xs px-2 py-0 hover:bg-transparent hover:text-blue-500"
              onClick={() => setFilters([])}
            >
              {t?.search?.clearAll || "Очистить все"}
            </Button>
          )}
        </div>
      )}
      
      {/* Командная панель */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3 pb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder={t?.search?.commandPlaceholder || "Поиск материалов, фильтры, история..."} 
              className="flex-1 border-0 focus-visible:ring-0 outline-none"
            />
          </div>
          <CommandList className="max-h-[400px]">
            <CommandEmpty>{t?.search?.noResults || "Нет результатов"}</CommandEmpty>
            
            {/* Быстрые действия */}
            <CommandGroup heading={t?.search?.quickActions || "Быстрые действия"}>
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false);
                  setIsFiltersOpen(true);
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>{t?.search?.showFilters || "Показать фильтры"}</span>
              </CommandItem>
              <CommandItem onSelect={handleClear}>
                <X className="mr-2 h-4 w-4" />
                <span>{t?.search?.clearSearch || "Очистить поиск"}</span>
              </CommandItem>
            </CommandGroup>
            
            {/* История поиска */}
            {searchHistory.length > 0 && (
              <CommandGroup heading={t?.search?.searchHistory || "История поиска"}>
                {searchHistory.map((item, index) => (
                  <CommandItem
                    key={`history-${index}`}
                    onSelect={() => applyHistoryItem(item)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <History className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{item.query}</span>
                      {item.filters.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.filters.length} {t?.search?.filters || "фильтров"})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatHistoryDate(item.timestamp)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {/* Категории */}
            <CommandGroup heading={t?.materials?.categories || "Категории"}>
              {categories.slice(0, 5).map((category) => (
                <CommandItem
                  key={category.id}
                  onSelect={() => {
                    addFilter({
                      id: `category-${category.id}`,
                      variant: 'category',
                      value: category.id,
                      label: category.name
                    });
                    setIsCommandOpen(false);
                  }}
                >
                  <Filter className="mr-2 h-4 w-4 text-green-500" />
                  <span>{category.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            
            {/* Единицы измерения */}
            <CommandGroup heading={t?.materials?.units || "Единицы измерения"}>
              {units.slice(0, 5).map((unit, i) => (
                <CommandItem
                  key={`unit-cmd-${i}`}
                  onSelect={() => {
                    addFilter({
                      id: `unit-${unit}`,
                      variant: 'unit',
                      value: unit,
                      label: unit
                    });
                    setIsCommandOpen(false);
                  }}
                >
                  <Tag className="mr-2 h-4 w-4 text-blue-500" />
                  <span>{unit}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

// CSS helper: скрывает полосу прокрутки, но позволяет скроллить
// Перенесено в globals.css для избежания проблем с SSR
