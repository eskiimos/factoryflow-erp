# Архитектурные решения FactoryFlow ERP

## Обзор архитектуры
FactoryFlow ERP построена на современном стеке технологий с акцентом на производительность, масштабируемость и удобство разработки.

## Технологический стек

### Frontend
- **Next.js 15** (App Router) - React framework с серверным рендерингом
- **React 18** - Библиотека для построения пользовательских интерфейсов
- **TypeScript** - Строгая типизация для надежности кода
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Готовые компоненты с высоким качеством дизайна
- **Lucide React** - Иконки (stroke-width: 1.5px)

### Backend
- **Next.js API Routes** - Serverless функции
- **Prisma ORM** - Type-safe работа с базой данных
- **SQLite** - Встроенная база данных (легко мигрировать на PostgreSQL)

### Дизайн система
- **Bento Grid Layout** - Современный grid-based дизайн
- **Light Theme Only** - Оптимизировано для производственной среды
- **Цветовая схема**: Background #F8FAFC, Cards #FFFFFF, Primary #2563EB→#3B82F6

## Архитектурные принципы

### 1. Separation of Concerns
```
/src/
  ├── app/              # Next.js App Router страницы
  ├── components/       # Переиспользуемые React компоненты  
  ├── lib/              # Утилиты и конфигурация
  ├── data/             # Константы и справочные данные
  └── hooks/            # Кастомные React hooks
```

### 2. API Design Patterns
```typescript
// RESTful endpoints
GET    /api/products          # Список товаров
GET    /api/products/[id]     # Конкретный товар
POST   /api/products          # Создание товара
PUT    /api/products/[id]     # Обновление товара
DELETE /api/products/[id]     # Мягкое удаление товара

// Вложенные ресурсы
POST   /api/products/[id]/materials    # Добавление материала
DELETE /api/products/[id]/materials/[materialId]  # Удаление материала
```

### 3. Database Design Philosophy

#### Soft Delete Pattern
Все сущности используют поле `isActive: Boolean` вместо физического удаления:
```prisma
model Product {
  id       Int     @id @default(autoincrement())
  name     String
  isActive Boolean @default(true)
  // ... другие поля
}
```

**Преимущества**:
- Сохранение истории операций
- Возможность восстановления данных
- Целостность связей между таблицами
- Аудит и отчетность

#### Нормализация vs Денормализация
- **Нормализованы**: Основные справочники (материалы, виды работ, фонды)
- **Денормализованы**: Расчетные поля (totalCost, productionTime) для производительности

#### Связи Many-to-Many через Junction Tables
```prisma
// Товар может использовать много материалов
model MaterialUsage {
  id         Int      @id @default(autoincrement())
  productId  Int
  materialId Int  
  quantity   Float
  
  product    Product     @relation(fields: [productId], references: [id])
  material   MaterialItem @relation(fields: [materialId], references: [id])
  
  @@unique([productId, materialId])
}
```

### 4. Component Architecture

#### Композиция компонентов
```typescript
// Атомарные компоненты
<Button /> <Input /> <Select />

// Молекулы  
<MaterialSelector /> <PriceCalculator />

// Организмы
<EditProductPage /> <ProductsTable />

// Шаблоны
<DashboardLayout /> <ProductLayout />
```

#### Props Drilling vs Context
```typescript
// Для глобального состояния - Context
const ThemeContext = createContext()
const UserContext = createContext()

// Для локального состояния - Props drilling или useState
const EditProductPage = ({ product }) => {
  const [formData, setFormData] = useState(product)
  return <ProductForm data={formData} onChange={setFormData} />
}
```

### 5. State Management Strategy

#### Локальное состояние (useState)
- Формы и UI состояние
- Временные данные
- Компонентные флаги (loading, error)

#### Server State (SWR/React Query потенциально)
- Данные с сервера
- Кэширование API ответов
- Автоматическая ревалидация

#### URL State (searchParams)
- Фильтры и сортировка
- Пагинация
- Навигационное состояние

### 6. Error Handling Strategy

#### API Level
```typescript
// /api/products/route.ts
export async function GET() {
  try {
    const products = await prisma.product.findMany()
    return Response.json({ data: products })
  } catch (error) {
    console.error('Products fetch error:', error)
    return Response.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    )
  }
}
```

#### Component Level
```typescript
const ProductsPage = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  if (error) return <ErrorBoundary error={error} />
  if (loading) return <LoadingSkeleton />
  
  return <ProductsTable />
}
```

#### User Experience
- Toast уведомления для операций
- Inline валидация форм
- Graceful degradation при ошибках

### 7. Performance Optimizations

#### React Optimizations
```typescript
// Мемоизация дорогих вычислений
const totalCost = useMemo(() => 
  materialsCost + laborCost + overheadCost, 
  [materialsCost, laborCost, overheadCost]
)

// Дебаунс для поиска
const debouncedSearch = useCallback(
  debounce((query) => fetchProducts(query), 300),
  []
)
```

#### Database Optimizations
```prisma
// Индексы для частых запросов
model Product {
  name     String
  isActive Boolean
  
  @@index([isActive])
  @@index([name])
}

// Eager loading связанных данных
const productWithUsages = await prisma.product.findUnique({
  where: { id },
  include: {
    materialUsages: { include: { material: true } },
    workTypeUsages: { include: { workType: true } },
    productFundUsages: { include: { fund: true } }
  }
})
```

#### Bundle Optimizations
- Tree-shaking неиспользуемого кода
- Dynamic imports для больших компонентов
- Оптимизация изображений через Next.js Image

### 8. Security Considerations

#### Input Validation
```typescript
// Zod схемы для валидации
const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  sellingPrice: z.number().positive(),
  isActive: z.boolean()
})

// Валидация на API level
export async function POST(request: Request) {
  const body = await request.json()
  const validatedData = ProductSchema.parse(body)
  // ... обработка
}
```

#### SQL Injection Prevention
- Prisma ORM автоматически параметризует запросы
- Никакого raw SQL без крайней необходимости

#### XSS Prevention
- React автоматически экранирует контент
- Использование dangerouslySetInnerHTML только при необходимости
- Content Security Policy заголовки

### 9. Testing Strategy

#### Unit Tests
```typescript
// Утилиты и чистые функции
test('calculateTotalCost should sum all costs', () => {
  expect(calculateTotalCost(100, 50, 25)).toBe(175)
})
```

#### Integration Tests  
```typescript
// API endpoints
test('GET /api/products should return products list', async () => {
  const response = await fetch('/api/products')
  expect(response.status).toBe(200)
  const data = await response.json()
  expect(Array.isArray(data.data)).toBe(true)
})
```

#### Component Tests
```typescript
// React компоненты
test('ProductForm should validate required fields', () => {
  render(<ProductForm />)
  fireEvent.click(screen.getByText('Save'))
  expect(screen.getByText('Name is required')).toBeInTheDocument()
})
```

### 10. Development Workflow

#### Code Style
```typescript
// Строгая типизация
interface ProductFormProps {
  product: Product
  onSave: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

// Именование файлов
kebab-case: product-form.tsx
PascalCase: ProductForm (компонент)
camelCase: productData (переменная)
```

#### Git Workflow
```bash
# Feature branches
git checkout -b feature/product-pricing-logic
git checkout -b fix/material-cost-calculation
git checkout -b refactor/api-error-handling
```

#### Environment Management
```env
# .env.local
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_ENV="development"
UPLOAD_DIR="./public/uploads"
```

### 11. Deployment Architecture

#### Development
- SQLite база данных
- Local file uploads
- Hot reload для быстрой разработки

#### Production (рекомендации)
- PostgreSQL для масштабируемости  
- S3/CloudStorage для файлов
- CDN для статических ресурсов
- PM2 для процесс-менеджмента

### 12. Мониторинг и логирование

#### Application Monitoring
```typescript
// Логирование ошибок
console.error('Product creation failed:', {
  productId,
  error: error.message,
  timestamp: new Date().toISOString(),
  userId: session?.user?.id
})
```

#### Performance Monitoring
- Core Web Vitals через Next.js Analytics
- Database query monitoring
- API response times

#### Business Metrics
- Количество созданных товаров
- Средняя маржинальность
- Время на создание товара (UX метрика)

Эта архитектурная документация поможет новым разработчикам понять принципы построения системы и следовать установленным паттернам при добавлении новой функциональности.
