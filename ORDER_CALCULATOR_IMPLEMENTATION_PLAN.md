# План реализации универсального калькулятора заказа

## Этап 1: Расширение базы данных (2-3 дня)

### 1.1 Добавить модель Customer
- Создать таблицу клиентов
- Связать с заказами
- Базовый CRUD для клиентов

### 1.2 Расширить модель Order
```sql
ALTER TABLE orders ADD COLUMN customer_id TEXT;
ALTER TABLE orders ADD COLUMN vat_rate REAL DEFAULT 20.0;
ALTER TABLE orders ADD COLUMN apply_vat BOOLEAN DEFAULT true;
ALTER TABLE orders ADD COLUMN total_cost_no_vat REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN total_vat_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN total_cost_with_vat REAL DEFAULT 0;
```

### 1.3 Расширить модель OrderItem
```sql
ALTER TABLE order_items ADD COLUMN name_snapshot TEXT;
ALTER TABLE order_items ADD COLUMN unit_snapshot TEXT;
ALTER TABLE order_items ADD COLUMN markup_type TEXT DEFAULT 'percent';
ALTER TABLE order_items ADD COLUMN markup_value REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN manual_price REAL;
ALTER TABLE order_items ADD COLUMN vat_rate REAL;
ALTER TABLE order_items ADD COLUMN unit_cost REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN line_cost REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN line_price_no_vat REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN vat_amount REAL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN line_price_with_vat REAL DEFAULT 0;
```

### 1.4 Создать snapshot таблицы
- OrderItemMaterial
- OrderItemWorkType  
- OrderItemFund

## Этап 2: API endpoints (1-2 дня)

### 2.1 Базовые операции
- GET /api/orders - список заказов
- POST /api/orders - создание заказа
- GET /api/orders/[id] - детали заказа
- PUT /api/orders/[id] - обновление заказа

### 2.2 Операции с позициями
- POST /api/orders/[id]/items - добавить товар в заказ
- PUT /api/orders/[id]/items/[itemId] - обновить позицию
- DELETE /api/orders/[id]/items/[itemId] - удалить позицию

### 2.3 Модульные операции
- GET /api/orders/[id]/items/[itemId]/composition - получить состав
- PUT /api/orders/[id]/items/[itemId]/materials - обновить материалы
- PUT /api/orders/[id]/items/[itemId]/worktypes - обновить работы
- PUT /api/orders/[id]/items/[itemId]/funds - обновить фонды

## Этап 3: Базовый интерфейс (2-3 дня)

### 3.1 Список заказов
- Таблица с фильтрацией
- Создание нового заказа
- Статусы и поиск

### 3.2 Детали заказа
- Информация о клиенте
- Настройки НДС
- Таблица позиций с итогами

### 3.3 Добавление товаров
- Поиск и выбор товаров
- Ввод количества
- Подтягивание состава

## Этап 4: Калькулятор позиции (3-4 дня)

### 4.1 Модальное окно калькулятора
- Вкладки: Состав, Цена
- Live пересчеты
- Snapshot механизм

### 4.2 Редактирование состава
- Материалы: добавить/удалить/изменить количество
- Работы: то же самое
- Фонды: процентные и фиксированные

### 4.3 Ценообразование
- Структура себестоимости
- Наценки менеджера (% и абсолютные)
- НДС расчеты
- Ручное переопределение цены

## Этап 5: Продвинутые функции (2-3 дня)

### 5.1 Сохранение как новый товар
- Создание Product из OrderItem
- Перенос состава
- Генерация артикула

### 5.2 Формульный модуль (опционально)
- Парсер выражений
- Параметры в UI
- Расчет эффективного количества

## Этап 6: Доработки и тесты (1-2 дня)

### 6.1 Валидации
- Проверка обязательных полей
- Валидация процентов и количеств
- Бизнес-правила

### 6.2 UX улучшения
- Автосохранение
- Горячие клавиши
- Подтверждения действий

## Общая оценка: 11-17 дней

### Критический путь:
1. База данных (3 дня)
2. API (2 дня) 
3. Базовый UI (3 дня)
4. Калькулятор (4 дня)

### Можно реализовать позже:
- Формульный модуль
- Продвинутые отчеты
- Интеграции

## Технические решения

### Архитектура компонентов:
```
/src/app/orders/
  - page.tsx (список заказов)
  - create/page.tsx (создание заказа)
  - [id]/page.tsx (детали заказа)
  
/src/components/orders/
  - order-list.tsx
  - order-form.tsx
  - order-item-calculator.tsx (модальное окно)
  - composition-editor.tsx (редактор состава)
  - pricing-panel.tsx (панель ценообразования)
```

### Типы данных:
```typescript
interface OrderWithItems extends Order {
  items: (OrderItem & {
    materials: OrderItemMaterial[]
    workTypes: OrderItemWorkType[]
    funds: OrderItemFund[]
  })[]
  customer?: Customer
}
```

### Состояние приложения:
- Использовать React Hook Form для форм
- Zustand для глобального состояния калькулятора
- Optimistic updates для live пересчетов
```
