# 🛠️ План устранения критичных рисков - FactoryFlow ERP

## 🚨 КРИТИЧНО: Безопасность формул (Приоритет #1)

### Текущая проблема
```typescript
// ❌ ОПАСНО: Выполнение произвольного JavaScript кода
const result = (new Function(...Object.keys(safeContext), `return ${processedExpression}`))(...Object.values(safeContext))
```

### ✅ Решение: Безопасный парсер формул

**Создан:** `/src/lib/safe-formula-parser.ts`

**Интеграция в calculation-engine.ts:**
```typescript
// Заменить опасное выполнение на:
import { safeFormulaParser } from './safe-formula-parser'

// Вместо Function constructor
const result = safeFormulaParser.parseAndExecute(processedExpression, safeContext)
```

**Время реализации:** 1 час  
**Статус:** ✅ Готово

---

## 🔒 Input Validation (Приоритет #2)

### Проблема
Отсутствие валидации пользовательского ввода во всех формах

### Решение
```typescript
// src/lib/input-validator.ts
export const validateInput = {
  productName: (name: string) => {
    if (!name || name.trim().length < 2) {
      throw new Error('Название должно содержать минимум 2 символа')
    }
    if (name.length > 100) {
      throw new Error('Название слишком длинное (максимум 100 символов)')
    }
    if (/<script|javascript:|data:/i.test(name)) {
      throw new Error('Недопустимые символы в названии')
    }
    return name.trim()
  },

  price: (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Цена должна быть числом')
    }
    if (num < 0) {
      throw new Error('Цена не может быть отрицательной')
    }
    if (num > 1000000000) {
      throw new Error('Цена слишком большая')
    }
    return num
  },

  formula: (formula: string) => {
    // Используем наш безопасный парсер
    const validation = safeFormulaParser.validate(formula, {})
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    return formula
  }
}
```

**Время реализации:** 2 часа  
**Статус:** 🔧 В разработке

---

## 💾 Backup System (Приоритет #3)

### Проблема
SQLite база данных без автоматического резервного копирования

### Решение
```bash
# scripts/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/factoryflow"
DB_PATH="./prisma/dev.db"

# Создаем директорию для бэкапов
mkdir -p $BACKUP_DIR

# Копируем базу данных
cp $DB_PATH "$BACKUP_DIR/dev_$DATE.db"

# Сжимаем старые бэкапы (старше 7 дней)
find $BACKUP_DIR -name "*.db" -mtime +7 -exec gzip {} \;

# Удаляем очень старые бэкапы (старше 30 дней)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: dev_$DATE.db"
```

**Cron задача:**
```bash
# Каждый день в 2:00 AM
0 2 * * * /path/to/scripts/backup.sh
```

**Время реализации:** 30 минут  
**Статус:** 📋 Запланировано

---

## 📊 Error Monitoring (Приоритет #4)

### Проблема
Нет системы мониторинга ошибок и производительности

### Решение: Простое логирование
```typescript
// src/lib/logger.ts
export class Logger {
  static error(message: string, error?: Error, context?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error?.message,
      stack: error?.stack,
      context
    }
    
    console.error('🚨 ERROR:', logEntry)
    
    // В продакшене отправляем в файл или внешний сервис
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(logEntry)
    }
  }

  static performance(operation: string, duration: number, context?: any) {
    if (duration > 1000) { // Логируем медленные операции
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'PERFORMANCE',
        operation,
        duration: `${duration}ms`,
        context
      }
      
      console.warn('⚠️ SLOW OPERATION:', logEntry)
    }
  }

  private static sendToLogService(logEntry: any) {
    // Интеграция с Sentry, LogRocket или файловым логированием
    // TODO: Реализовать отправку логов
  }
}
```

**Интеграция в calculation-engine.ts:**
```typescript
// Заменить console.error на Logger.error
Logger.error('Formula calculation failed', error, { expression, context })

// Добавить мониторинг производительности
const startTime = Date.now()
const result = safeFormulaParser.parseAndExecute(expression, context)
Logger.performance('formula_calculation', Date.now() - startTime, { expression })
```

**Время реализации:** 1 час  
**Статус:** 📋 Запланировано

---

## 🧪 Error Boundaries (Приоритет #5)

### Проблема
React компоненты могут "падать" без graceful handling

### Решение
```tsx
// src/components/error-boundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-semibold">Произошла ошибка</h3>
          <p className="text-red-600 text-sm mt-1">
            Что-то пошло не так. Попробуйте обновить страницу.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Обновить страницу
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Использование:**
```tsx
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

**Время реализации:** 45 минут  
**Статус:** 📋 Запланировано

---

## 📋 Чек-лист реализации

### Неделя 1 (Критично)
- [x] ✅ Создан SafeFormulaParser
- [ ] 🔧 Интегрировать SafeFormulaParser в calculation-engine
- [ ] 🔧 Добавить input validation во все формы
- [ ] 🔧 Создать Logger систему
- [ ] 🔧 Добавить Error Boundaries

### Неделя 2 (Важно)
- [ ] 📋 Настроить автоматические бэкапы
- [ ] 📋 Добавить rate limiting для API
- [ ] 📋 Создать health check endpoint
- [ ] 📋 Добавить HTTPS принудительно

### Неделя 3 (Улучшения)
- [ ] 📋 Оптимизировать Prisma запросы
- [ ] 📋 Добавить кэширование
- [ ] 📋 Создать monitoring dashboard
- [ ] 📋 Написать тесты для критичных функций

---

## 🎯 Измерение успеха

### Метрики безопасности
- **0** уязвимостей в формулах (цель: 100% блокировка опасного кода)
- **0** XSS атак через пользовательский ввод
- **100%** покрытие input validation

### Метрики надежности
- **99.9%** uptime системы
- **<500ms** среднее время ответа API
- **<3 секунды** время загрузки страниц

### Метрики качества данных
- **0** потерь данных
- **Ежедневные** успешные бэкапы
- **<1%** ошибок в вычислениях

---

## 💰 Оценка затрат

### Время разработки
- **Безопасность формул**: 2 часа ✅ Готово
- **Input validation**: 4 часа
- **Monitoring система**: 6 часов
- **Backup система**: 2 часа
- **Error handling**: 3 часа
- **Тестирование**: 8 часов

**Итого: ~25 часов разработки**

### Инфраструктурные затраты
- **Backup storage**: $10/месяц
- **Monitoring service**: $20/месяц (опционально)
- **SSL сертификат**: Бесплатно (Let's Encrypt)

**Итого: $10-30/месяц**

### ROI (Return on Investment)
- **Предотвращение потери данных**: Бесценно
- **Экономия времени на отладку**: 10+ часов/месяц
- **Репутационные риски**: Высокие потери при взломе

**Вывод: Критически важные инвестиции с высокой окупаемостью**
