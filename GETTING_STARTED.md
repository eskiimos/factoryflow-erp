# 🚀 Быстрый старт для новых разработчиков

Добро пожаловать в **FactoryFlow ERP**! Это руководство поможет вам быстро разобраться в проекте и начать разработку.

## 📋 Что нужно знать перед началом

### Концепция системы
FactoryFlow ERP - это система управления производством с акцентом на **полный расчет себестоимости товаров**. Основная идея: пользователь создает товар поэтапно, добавляя материалы, виды работ и фонды, а система автоматически рассчитывает себестоимость и предлагает оптимальную цену.

### Ключевые принципы
- **Пошаговый workflow** - 6 этапов создания товара
- **Soft Delete** - все удаления логические (isActive: false)
- **Real-time calculations** - расчеты в реальном времени
- **Mobile-first design** - адаптивный интерфейс
- **TypeScript everywhere** - строгая типизация

## 🎯 Первые 30 минут

### 1. Установка и запуск (5 минут)
```bash
# Клонируем проект
git clone https://github.com/yourusername/factoryflow-erp.git
cd factoryflow-erp

# Устанавливаем зависимости
npm install

# Настраиваем базу данных
npm run db:migrate
npm run db:seed

# Запускаем в режиме разработки
npm run dev
```

### 2. Изучение структуры (10 минут)
Откройте эти файлы в следующем порядке:

1. **`/prisma/schema.prisma`** - схема базы данных
2. **`/src/components/edit-product-page.tsx`** - главный компонент
3. **`/src/app/api/products/[id]/route.ts`** - API товаров
4. **`/src/app/products/page.tsx`** - страница списка товаров

### 3. Создание тестового товара (15 минут)
1. Перейдите на http://localhost:3000
2. Зайдите в раздел "Товары" → "Создать товар"
3. Пройдите все 6 этапов:
   - **Основное**: Введите название "Тестовый товар"
   - **Материалы**: Добавьте любой материал
   - **Работы**: Добавьте вид работ
   - **Фонды**: Добавьте фонд
   - **Ценообразование**: Посмотрите на автоматический расчет
   - **Настройки**: Настройте остатки
4. Сохраните товар и изучите результат

## 📚 Основные файлы для изучения

### Компоненты (в порядке важности)
```
/src/components/
├── edit-product-page.tsx          # 🔥 ГЛАВНЫЙ - система табов и расчетов
├── add-material-dialog.tsx        # Диалог добавления материала
├── add-work-type-dialog.tsx       # Диалог добавления работ
├── add-fund-dialog.tsx            # Диалог добавления фондов
└── ui/                            # shadcn/ui компоненты
```

### API Routes (критически важные)
```
/src/app/api/
├── products/
│   ├── [id]/route.ts             # CRUD товаров
│   ├── [id]/materials/route.ts   # Управление материалами товара
│   ├── [id]/work-types/route.ts  # Управление работами товара
│   └── [id]/funds/route.ts       # Управление фондами товара
├── materials/route.ts            # CRUD материалов
├── work-types/route.ts           # CRUD видов работ
└── funds/route.ts                # CRUD фондов
```

### Страницы
```
/src/app/
├── page.tsx                      # Дашборд (главная)
├── products/
│   ├── page.tsx                  # Список товаров
│   └── [id]/page.tsx             # Редактирование товара
├── materials/page.tsx            # Управление материалами
└── layout.tsx                    # Общий лейаут
```

## 🧠 Понимание архитектуры данных

### Основные модели
```typescript
Product {
  id, name, description, unit, sellingPrice
  categoryId, isActive
  currentStock, minStock, maxStock
}

// Связи товара с ресурсами
MaterialUsage { productId, materialId, quantity }
WorkTypeUsage { productId, workTypeId, estimatedTime }
ProductFundUsage { productId, fundId, allocationPercentage }

// Ресурсы
MaterialItem { name, price, unit, currency }
WorkType { name, hourlyRate, departmentId }
Fund { name, totalAmount, categoryId }
```

### Расчеты
```typescript
// Себестоимость = Материалы + Работы + Фонды
totalCost = 
  Σ(material.price × usage.quantity) +           // Материалы
  Σ(workType.hourlyRate × usage.estimatedTime) + // Работы  
  Σ(fund.totalAmount × usage.percentage / 100)   // Фонды

// Время производства
productionTime = Σ(workTypeUsage.estimatedTime)

// Прибыль и маржа
profit = sellingPrice - totalCost
marginPercentage = (profit / totalCost) × 100
```

## 🔧 Как добавить новую функцию

### Пример: Добавление поля "Вес товара"

#### 1. Обновить схему Prisma
```prisma
model Product {
  // ... существующие поля
  weight Float? // Вес в килограммах
}
```

#### 2. Создать миграцию
```bash
npx prisma migrate dev --name add-product-weight
```

#### 3. Обновить TypeScript типы
```typescript
// /src/types/product.ts
interface ProductFormData {
  // ... существующие поля
  weight?: number
}
```

#### 4. Добавить поле в форму
```tsx
// /src/components/edit-product-page.tsx
// В TabsContent value="basic"
<div>
  <Label>Вес, кг</Label>
  <Input
    type="number"
    value={formData.weight || ''}
    onChange={(e) => setFormData(prev => ({ 
      ...prev, 
      weight: parseFloat(e.target.value) || undefined 
    }))}
    placeholder="0.0"
  />
</div>
```

#### 5. Обновить API
```typescript
// /src/app/api/products/[id]/route.ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { weight, ...otherFields } = body
  
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: {
      ...otherFields,
      weight: weight ? parseFloat(weight) : null
    }
  })
  
  return Response.json({ data: product })
}
```

## 🎨 Дизайн-система

### Цвета
```css
/* Основные цвета */
background: #F8FAFC     /* Фон страницы */
card: #FFFFFF          /* Фон карточек */
primary: #2563EB       /* Основной цвет */
secondary: #64748B     /* Вторичный цвет */
success: #059669       /* Успех/прибыль */
danger: #DC2626        /* Ошибка/убыток */
```

### Компоненты shadcn/ui
- `<Button />` - кнопки с вариантами
- `<Card />` - контейнеры
- `<Input />` - поля ввода
- `<Select />` - выпадающие списки
- `<Dialog />` - модальные окна
- `<Table />` - таблицы данных

### Layout принципы
- **Bento Grid**: gap-6, rounded-2xl, shadow-lg/10
- **Responsive**: Mobile-first подход
- **Typography**: font-sans, leading-relaxed

## 🔍 Отладка и тестирование

### Полезные команды
```bash
# Посмотреть логи базы данных
npx prisma studio

# Сбросить базу и пересоздать
npm run db:reset

# Проверить типы TypeScript
npm run type-check

# Запустить тесты
npm run test
```

### Отладка в браузере
1. Откройте DevTools (F12)
2. Network tab - для отслеживания API запросов
3. Console - для логов и ошибок
4. React DevTools - для состояния компонентов

### Частые проблемы
- **Prisma Client не обновился** → `npx prisma generate`
- **Медленная загрузка** → Очистить кэш: `npm run dev -- --no-cache`
- **TypeScript ошибки** → Перезапустить VS Code TypeScript сервер

## 📋 Чек-лист для новых фич

### Перед началом разработки
- [ ] Понимаю бизнес-требования
- [ ] Изучил существующий код в похожей области
- [ ] Проверил, нет ли уже готового решения
- [ ] Написал план изменений

### Во время разработки
- [ ] Обновил схему Prisma (если нужно)
- [ ] Добавил TypeScript типы
- [ ] Обновил API endpoints
- [ ] Добавил UI компоненты
- [ ] Протестировал в браузере

### Перед коммитом
- [ ] Код проходит TypeScript проверки
- [ ] Нет console.log в production коде
- [ ] Обновил документацию (если нужно)
- [ ] Тестировал на разных размерах экрана

## 🤝 Стиль кода

### Именование
```typescript
// Файлы компонентов
kebab-case: product-form.tsx

// React компоненты
PascalCase: ProductForm

// Переменные и функции
camelCase: productData, calculateTotalCost

// Константы
UPPER_CASE: MAX_UPLOAD_SIZE

// API routes
kebab-case: /api/work-types
```

### TypeScript
```typescript
// Всегда указывайте типы для props
interface ProductFormProps {
  product: Product
  onSave: (data: ProductFormData) => Promise<void>
}

// Используйте enum для констант
enum ProductStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

// Обрабатывайте ошибки
try {
  const result = await api.createProduct(data)
  toast.success('Товар создан')
} catch (error) {
  toast.error('Ошибка создания товара')
  console.error(error)
}
```

## 📞 Получение помощи

### Документация
- **[PRODUCT_WORKFLOW_GUIDE.md](./PRODUCT_WORKFLOW_GUIDE.md)** - детальное описание каждого этапа
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - архитектурные принципы
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - примеры API запросов

### Полезные ресурсы
- [Next.js документация](https://nextjs.org/docs)
- [Prisma документация](https://www.prisma.io/docs)
- [shadcn/ui компоненты](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Дебаггинг
1. Проверьте консоль браузера на ошибки
2. Посмотрите Network tab для API запросов
3. Используйте `console.log()` для отладки состояния
4. Prisma Studio для просмотра данных: `npx prisma studio`

---

**Добро пожаловать в команду! 🚀**

После прочтения этого руководства вы должны понимать:
- Как устроена система (6 этапов создания товара)
- Где находится основной код
- Как добавлять новые функции
- Как отлаживать проблемы

Начните с создания тестового товара и изучения компонента `edit-product-page.tsx` - это 80% понимания системы!
