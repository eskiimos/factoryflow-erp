# Руководство по рабочему процессу создания товара

## Обзор системы
FactoryFlow ERP предоставляет пошаговый процесс создания и управления товарами с полным расчетом себестоимости и интеллектуальным ценообразованием.

## Структура workflow - 6 этапов

### 🔵 Этап 1: Основное (Basic Information)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="basic"

**Цель**: Определение базовых характеристик товара и визуального представления

**Компоненты интерфейса**:
- Левая колонка: Форма основной информации
  - Название товара (обязательное поле)
  - Описание товара (текстовая область)
  - Единица измерения (выпадающий список)
  - Категория товара (селект с возможностью добавления новых)
- Правая колонка: Загрузка изображения
  - Drag & drop зона с hover-эффектами
  - Поддержка JPG, PNG до 20MB
  - Подсказка о повышении конверсии на 30-40%

**Бизнес-логика**:
- Валидация обязательных полей
- Автоматическое создание slug из названия
- Интеграция с системой категорий
- Оптимизация изображений для web

**Техническая реализация**:
```typescript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  unit: '',
  categoryId: null,
  imageUrl: null
})
```

---

### 🔵 Этап 2: Материалы (Materials & Components)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="materials"

**Цель**: Определение сырья и комплектующих с расчетом материальных затрат

**Компоненты интерфейса**:
- Таблица используемых материалов
- Кнопка добавления нового материала
- Поля количества для каждого материала
- Автоматический расчет стоимости материалов
- Диалог создания нового материала (`AddMaterialDialog`)

**Бизнес-логика**:
- Связь товара с материалами через `MaterialUsage`
- Расчет: `Σ(material.price × usage.quantity)`
- Управление складскими остатками материалов
- Контроль доступности материалов

**Техническая реализация**:
```typescript
// API: GET /api/materials - получение списка материалов
// API: POST /api/products/[id]/materials - добавление материала к товару
const materialsCost = materialUsages.reduce((sum, usage) => 
  sum + (usage.material.price * usage.quantity), 0
)
```

**База данных**:
```sql
MaterialUsage {
  id: Int (Primary Key)
  productId: Int (Foreign Key -> Product)
  materialId: Int (Foreign Key -> MaterialItem)
  quantity: Float
}
```

---

### 🔵 Этап 3: Работы (Work Types & Labor)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="work"

**Цель**: Определение трудовых затрат и времени производства

**Компоненты интерфейса**:
- Таблица видов работ с временными нормами
- Кнопка добавления нового вида работ
- Поля времени (в часах) для каждого вида работ
- Автоматический расчет трудозатрат
- Диалог создания нового вида работ (`AddWorkTypeDialog`)

**Бизнес-логика**:
- Связь товара с видами работ через `WorkTypeUsage`
- Расчет стоимости: `Σ(workType.hourlyRate × usage.estimatedTime)`
- Расчет общего времени производства: `Σ(usage.estimatedTime)`
- Планирование производственных мощностей

**Техническая реализация**:
```typescript
// API: GET /api/work-types - получение списка видов работ
// API: POST /api/products/[id]/work-types - добавление работы к товару
const laborCost = workTypeUsages.reduce((sum, usage) => 
  sum + (usage.workType.hourlyRate * usage.estimatedTime), 0
)

const productionTime = workTypeUsages.reduce((sum, usage) => 
  sum + usage.estimatedTime, 0
)
```

**База данных**:
```sql
WorkTypeUsage {
  id: Int (Primary Key)
  productId: Int (Foreign Key -> Product)
  workTypeId: Int (Foreign Key -> WorkType)
  estimatedTime: Float (часы)
}
```

---

### 🔵 Этап 4: Фонды (Fund Usage & Overhead)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="funds"

**Цель**: Распределение накладных расходов и использование фондов

**Компоненты интерфейса**:
- Таблица используемых фондов
- Поля процентного распределения для каждого фонда
- Автоматический расчет накладных расходов
- Диалог создания нового фонда (`AddFundDialog`)
- Валидация суммы процентов (не должна превышать 100%)

**Бизнес-логика**:
- Связь товара с фондами через `ProductFundUsage`
- Расчет накладных: `Σ(fund.totalAmount × usage.allocationPercentage / 100)`
- Контроль распределения бюджета фондов
- Аналитика использования ресурсов

**Техническая реализация**:
```typescript
// API: GET /api/funds - получение списка фондов
// API: POST /api/products/[id]/funds - добавление фонда к товару
const overheadCost = productFundUsages.reduce((sum, usage) => 
  sum + (usage.fund.totalAmount * usage.allocationPercentage / 100), 0
)

// Валидация процентов
const totalPercentage = productFundUsages.reduce((sum, usage) => 
  sum + usage.allocationPercentage, 0
)
```

**База данных**:
```sql
ProductFundUsage {
  id: Int (Primary Key)
  productId: Int (Foreign Key -> Product)
  fundId: Int (Foreign Key -> Fund)
  allocationPercentage: Float (0-100)
}
```

---

### 🔵 Этап 5: Ценообразование (Pricing & Profitability)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="pricing"

**Цель**: Интеллектуальное ценообразование с анализом прибыльности

**Компоненты интерфейса**:
- Сводка всех затрат (материалы + работы + фонды)
- Поле цены продажи с автоматическими рекомендациями
- Кнопки быстрой наценки (15%, 20%, 25%, 30%)
- Анализ прибыльности с цветовыми индикаторами
- Метрики: прибыль за час, общая маржа
- Бизнес-рекомендации на основе уровня маржи

**Бизнес-логика**:
- Общая себестоимость: `materialsCost + laborCost + overheadCost`
- Рекомендуемая цена: `totalCost × (1 + marginPercentage)`
- Прибыль: `sellingPrice - totalCost`
- Маржа: `(sellingPrice - totalCost) / totalCost × 100%`
- Прибыль в час: `profit / productionTime`

**Техническая реализация**:
```typescript
const totalCost = materialsCost + laborCost + overheadCost
const profit = (formData.sellingPrice || 0) - totalCost
const marginPercentage = totalCost > 0 ? (profit / totalCost * 100) : 0
const profitPerHour = productionTime > 0 ? profit / productionTime : 0

// Автоматические рекомендации
const getRecommendedPrice = (margin: number) => totalCost * (1 + margin / 100)

// Бизнес-анализ
const getBusinessRecommendation = () => {
  if (profit <= 0) return "⚠️ Убыточный товар"
  if (marginPercentage < 15) return "📈 Низкая маржа"
  if (marginPercentage <= 30) return "✅ Оптимальная маржа"
  return "🎯 Высокая маржа"
}
```

**Аналитические метрики**:
- Точка безубыточности
- Конкурентоспособность цены
- ROI по времени производства
- Сезонные коэффициенты (будущая функциональность)

---

### 🔵 Этап 6: Настройки (Production Settings)
**Файл**: `/src/components/edit-product-page.tsx` - TabsContent value="settings"

**Цель**: Производственные параметры и управление запасами

**Компоненты интерфейса**:
- Визуализация времени производства (дни/часы/минуты)
- Настройки складских остатков (текущий/мин/макс)
- Статус товара (активный/неактивный)
- Настройки автоматизации процессов
- Система тегов и категоризации

**Бизнес-логика**:
- Контроль производственного цикла
- Управление запасами с уведомлениями
- Автоматизация пополнения склада
- Планирование производственных мощностей

**Техническая реализация**:
```typescript
// Разбивка времени производства
const days = Math.floor(productionTime / 24)
const hours = Math.floor(productionTime % 24)  
const minutes = Math.round((productionTime % 1) * 60)

// Управление запасами
const stockStatus = {
  isLowStock: formData.currentStock <= formData.minStock,
  isOverStock: formData.currentStock >= formData.maxStock,
  optimalRange: formData.minStock < formData.currentStock < formData.maxStock
}
```

**База данных (Product)**:
```sql
Product {
  currentStock: Float
  minStock: Float  
  maxStock: Float
  isActive: Boolean
  productionTime: Float (автоматически рассчитывается)
}
```

---

## Интеграция между этапами

### Поток данных:
1. **Основное** → Создает базовый объект товара
2. **Материалы** → Добавляет MaterialUsage записи
3. **Работы** → Добавляет WorkTypeUsage записи + рассчитывает productionTime
4. **Фонды** → Добавляет ProductFundUsage записи
5. **Ценообразование** → Агрегирует все затраты + рассчитывает цены
6. **Настройки** → Финализирует параметры производства

### Автоматические пересчеты:
- При изменении материалов → пересчет materialsCost
- При изменении работ → пересчет laborCost + productionTime  
- При изменении фондов → пересчет overheadCost
- При любых изменениях → пересчет totalCost и рекомендаций по цене

### Валидация:
- Этап 1: Обязательные поля (название, единица измерения)
- Этап 2-4: Проверка доступности ресурсов
- Этап 5: Валидация цены (не ниже себестоимости)
- Этап 6: Логическая проверка остатков (мин < макс)

---

## Технические детали реализации

### Состояние компонента:
```typescript
interface ProductFormData {
  // Этап 1
  name: string
  description: string  
  unit: string
  categoryId: number | null
  imageUrl: string | null
  
  // Этап 5
  sellingPrice: number
  
  // Этап 6  
  currentStock: number
  minStock: number
  maxStock: number
  isActive: boolean
}

interface UsageData {
  materialUsages: MaterialUsage[]
  workTypeUsages: WorkTypeUsage[]  
  productFundUsages: ProductFundUsage[]
}
```

### API Integration:
```typescript
// Получение полных данных товара
GET /api/products/[id] 
// Возвращает: Product + MaterialUsage[] + WorkTypeUsage[] + ProductFundUsage[]

// Сохранение изменений
PUT /api/products/[id]
// Принимает: ProductFormData + все usage массивы
```

### Производительность:
- Debounced пересчеты при изменении полей
- Lazy loading справочников (материалы, работы, фонды)
- Оптимистичные обновления UI
- Кэширование расчетов

Эта документация поможет новому разработчику быстро понять логику каждого этапа и начать работу с системой.
