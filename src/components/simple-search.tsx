"use client"

import React, { useState, useEffect, useCallback, useRef, useDeferredValue } from "react"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/context/language-context"

export type SimpleSearchFilter = {
  id: string;
  variant: 'category' | 'unit' | 'price';
  value: string;
  label: string;
}

interface SimpleSearchProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (value: string, filters: SimpleSearchFilter[]) => void;
  debounceTime?: number;
  className?: string;
  disabled?: boolean;
  categories?: { id: string; name: string }[];
  units?: string[];
}

export function SimpleSearch({
  placeholder = "Поиск материалов...",
  initialValue = "",
  onSearch,
  debounceTime = 300,
  className = "",
  disabled = false,
  categories = [],
  units = []
}: SimpleSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [filters, setFilters] = useState<SimpleSearchFilter[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Используем deferredValue для плавного обновления
  const deferredInputValue = useDeferredValue(inputValue);

  // Эффект для обработки изменений с debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(deferredInputValue, filters);
    }, debounceTime);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [deferredInputValue, filters, onSearch, debounceTime]);

  // Синхронизируем входящее значение с полем ввода
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Обработка изменения поискового запроса
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // debounce обрабатывается в useEffect выше
  };

  // Очистка поиска
  const handleClear = () => {
    setInputValue("");
    setFilters([]);
    setSelectedCategory("");
    setSelectedUnit("");
    setMinPrice("");
    setMaxPrice("");
    // Мгновенно применяем без debounce
    onSearch("", []);
    // Возвращаем фокус на инпут
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Применение фильтров
  const applyFilters = () => {
    const newFilters: SimpleSearchFilter[] = [];
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        newFilters.push({
          id: `category-${selectedCategory}`,
          variant: 'category',
          value: selectedCategory,
          label: `Категория: ${category.name}`
        });
      }
    }
    
    if (selectedUnit) {
      newFilters.push({
        id: `unit-${selectedUnit}`,
        variant: 'unit',
        value: selectedUnit,
        label: `Единица: ${selectedUnit}`
      });
    }
    
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice 
        ? `Цена: ${minPrice} - ${maxPrice}` 
        : minPrice 
        ? `Цена от: ${minPrice}` 
        : `Цена до: ${maxPrice}`;
      
      newFilters.push({
        id: `price-${minPrice || 0}-${maxPrice || 999999}`,
        variant: 'price',
        value: `${minPrice || 0}-${maxPrice || 999999}`,
        label: priceLabel
      });
    }
    
    setFilters(newFilters);
    setIsFiltersOpen(false);
    // Мгновенно применяем без debounce
    onSearch(inputValue, newFilters);
  };

  // Удаление фильтра
  const removeFilter = (filterId: string) => {
    const newFilters = filters.filter(f => f.id !== filterId);
    setFilters(newFilters);
    
    // Очищаем соответствующие поля
    const removedFilter = filters.find(f => f.id === filterId);
    if (removedFilter) {
      if (removedFilter.type === 'category') {
        setSelectedCategory("");
      } else if (removedFilter.type === 'unit') {
        setSelectedUnit("");
      } else if (removedFilter.type === 'price') {
        setMinPrice("");
        setMaxPrice("");
      }
    }
    
    // Мгновенно применяем без debounce
    onSearch(inputValue, newFilters);
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    const newFilters: SimpleSearchFilter[] = [];
    setFilters(newFilters);
    setSelectedCategory("");
    setSelectedUnit("");
    setMinPrice("");
    setMaxPrice("");
    // Мгновенно применяем без debounce
    onSearch(inputValue, newFilters);
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Основное поле поиска */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="pl-10 pr-20 h-11 text-base"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Кнопка фильтров */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-100"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="font-medium text-sm">Фильтры поиска</div>
                
                {/* Категория */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Категория</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Единица измерения */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Единица измерения</label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите единицу" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Диапазон цен */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Диапазон цен</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="До"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={applyFilters} size="sm" className="flex-1">
                    Применить
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedUnit("");
                      setMinPrice("");
                      setMaxPrice("");
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Очистить
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Кнопка очистки */}
          {(inputValue || filters.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Активные фильтры */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Фильтры:</span>
          {filters.map((filter) => (
            <Badge 
              key={filter.id} 
              variant="secondary" 
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilter(filter.id)}
            >
              {filter.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs px-2 hover:bg-gray-100"
          >
            Очистить все
          </Button>
        </div>
      )}
    </div>
  );
}
