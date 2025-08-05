"use client"

import { useCallback, useRef, useMemo } from 'react';

// Интерфейс для элемента кэша
interface CacheItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

// Типы результатов поиска
type SearchResults = {
  data: any[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  success: boolean;
  timestamp: number;
}

// Настройки кэша
const CACHE_EXPIRY_TIME = 30 * 1000; // 30 секунд
const MAX_CACHE_ITEMS = 10;

export function useSearchCache() {
  // Создаем кэш с помощью useRef, чтобы сохранить его между рендерами
  const cache = useRef<Map<string, CacheItem<SearchResults>>>(new Map());

  // Генерация ключа кэша на основе параметров поиска
  const generateCacheKey = useCallback((searchTerm: string, filters: any[], page: number): string => {
    const filtersString = JSON.stringify(filters);
    return `${searchTerm}:${filtersString}:${page}`;
  }, []);
  
  // Получение данных из кэша
  const getFromCache = useCallback((key: string): SearchResults | null => {
    const now = Date.now();
    const cachedItem = cache.current.get(key);
    
    if (cachedItem && (now - cachedItem.timestamp) < CACHE_EXPIRY_TIME) {
      return cachedItem.data;
    }
    
    // Удаляем устаревшие записи
    if (cachedItem) {
      cache.current.delete(key);
    }
    
    return null;
  }, []);
  
  // Сохранение данных в кэш
  const saveToCache = useCallback((key: string, data: SearchResults): void => {
    // Обновляем временную метку перед сохранением
    data.timestamp = Date.now();
    
    // Добавляем в кэш
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    
    // Если кэш стал слишком большим, удаляем самый старый элемент
    if (cache.current.size > MAX_CACHE_ITEMS) {
      let oldestKey = '';
      let oldestTimestamp = Infinity;
      
      cache.current.forEach((item, itemKey) => {
        if (item.timestamp < oldestTimestamp) {
          oldestTimestamp = item.timestamp;
          oldestKey = itemKey;
        }
      });
      
      if (oldestKey) {
        cache.current.delete(oldestKey);
      }
    }
  }, []);
  
  // Очистка кэша
  const clearCache = useCallback((): void => {
    cache.current.clear();
  }, []);
  
  // Статистика кэша для отладки
  const cacheStats = useMemo(() => {
    return {
      size: cache.current.size,
      items: Array.from(cache.current.entries()).map(([key, item]) => ({
        key,
        age: Date.now() - item.timestamp
      }))
    };
  }, [cache.current.size]);
  
  return {
    generateCacheKey,
    getFromCache,
    saveToCache,
    clearCache,
    cacheStats
  };
}
