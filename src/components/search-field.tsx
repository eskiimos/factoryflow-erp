"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/context/language-context"

interface SearchFieldProps {
  placeholder?: string
  initialValue?: string
  onSearch: (value: string) => void
  debounceTime?: number
  className?: string
  disabled?: boolean
}

export function SearchField({
  placeholder,
  initialValue = "",
  onSearch,
  debounceTime = 200,
  className = "",
  disabled = false
}: SearchFieldProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(initialValue);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Оптимизированный обработчик изменений с debounce
  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Обновляем значение поля ввода немедленно для отзывчивости UI
    setInputValue(value);
    
    // Минимальный порог символов для начала поиска (чтобы избежать лишних запросов)
    const MIN_SEARCH_LENGTH = 2;
    const trimmedValue = value.trim();
    
    // Если запрос меньше минимальной длины - не запускаем поиск
    if (trimmedValue.length > 0 && trimmedValue.length < MIN_SEARCH_LENGTH) {
      setSearching(false);
      return;
    }
    
    // Показываем индикатор поиска только если есть что искать
    if (trimmedValue.length >= MIN_SEARCH_LENGTH) {
      setSearching(true);
    }
    
    // Увеличиваем задержку для поиска, чтобы избежать частых запросов
    const delay = trimmedValue.length >= MIN_SEARCH_LENGTH ? debounceTime : 100;
    
    // Live-поиск с задержкой
    searchTimeoutRef.current = setTimeout(() => {
      // Пропускаем отправку поискового запроса, если он пустой или меньше минимальной длины
      if (trimmedValue === "" || (trimmedValue.length < MIN_SEARCH_LENGTH && trimmedValue.length > 0)) {
        setSearching(false);
        onSearch("");
        return;
      }
      
      // Вызываем колбэк поиска для реального запроса
      onSearch(trimmedValue);
    }, delay);
  }, [onSearch, debounceTime]);

  // Обработчик очистки поля
  const handleClear = useCallback(() => {
    setInputValue("");
    onSearch("");
    
    // Возвращаем фокус на поле ввода
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onSearch]);

  return (
    <div className={`relative ${className}`}>
      {disabled || searching ? (
        <div className="absolute left-3 top-2.5 w-4 h-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      )}
      
      <Input
        placeholder={placeholder || t?.materials?.searchPlaceholder || "Поиск..."}
        value={inputValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10 w-full bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
        ref={searchInputRef}
        disabled={disabled}
        autoComplete="off"
      />
      
      {inputValue && (
        <button
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          title={t?.materials?.search?.clear || "Очистить поиск"}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}
