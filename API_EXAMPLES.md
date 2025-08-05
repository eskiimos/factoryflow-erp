# API Examples - FactoryFlow ERP

Примеры использования API для разработчиков.

## Базовые эндпоинты

### Товары (Products)

#### Получить список товаров
```http
GET /api/products
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Деревянный стол",
      "description": "Обеденный стол из массива дуба",
      "unit": "шт",
      "sellingPrice": 15000.00,
      "categoryId": 1,
      "isActive": true,
      "currentStock": 5,
      "minStock": 2,
      "maxStock": 20,
      "category": {
        "id": 1,
        "name": "Мебель"
      }
    }
  ]
}
```

#### Получить товар с полными данными
```http
GET /api/products/1
```

**Ответ:**
```json
{
  "data": {
    "id": 1,
    "name": "Деревянный стол",
    "description": "Обеденный стол из массива дуба",
    "unit": "шт",
    "sellingPrice": 15000.00,
    "categoryId": 1,
    "isActive": true,
    "currentStock": 5,
    "minStock": 2,
    "maxStock": 20,
    "category": {
      "id": 1,
      "name": "Мебель"
    },
    "materialUsages": [
      {
        "id": 1,
        "quantity": 2.5,
        "material": {
          "id": 1,
          "name": "Доска дубовая 40mm",
          "price": 2500.00,
          "unit": "м²",
          "currency": "RUB"
        }
      }
    ],
    "workTypeUsages": [
      {
        "id": 1,
        "estimatedTime": 8.0,
        "workType": {
          "id": 1,
          "name": "Столярные работы",
          "hourlyRate": 800.00,
          "department": {
            "name": "Производство"
          }
        }
      }
    ],
    "productFundUsages": [
      {
        "id": 1,
        "allocationPercentage": 15.0,
        "fund": {
          "id": 1,
          "name": "Амортизация оборудования",
          "totalAmount": 50000.00
        }
      }
    ]
  }
}
```

#### Создать новый товар
```http
POST /api/products
Content-Type: application/json

{
  "name": "Новый товар",
  "description": "Описание товара",
  "unit": "шт",
  "categoryId": 1,
  "sellingPrice": 1000.00,
  "currentStock": 0,
  "minStock": 1,
  "maxStock": 100,
  "isActive": true
}
```

#### Обновить товар
```http
PUT /api/products/1
Content-Type: application/json

{
  "name": "Обновленное название",
  "sellingPrice": 16000.00
}
```

#### Мягкое удаление товара
```http
DELETE /api/products/1
```

### Материалы товара

#### Добавить материал к товару
```http
POST /api/products/1/materials
Content-Type: application/json

{
  "materialId": 2,
  "quantity": 1.5
}
```

#### Обновить количество материала
```http
PUT /api/products/1/materials/2
Content-Type: application/json

{
  "quantity": 2.0
}
```

#### Удалить материал из товара
```http
DELETE /api/products/1/materials/2
```

### Виды работ товара

#### Добавить вид работ к товару
```http
POST /api/products/1/work-types
Content-Type: application/json

{
  "workTypeId": 1,
  "estimatedTime": 4.0
}
```

#### Обновить время работы
```http
PUT /api/products/1/work-types/1
Content-Type: application/json

{
  "estimatedTime": 6.0
}
```

#### Удалить вид работ из товара
```http
DELETE /api/products/1/work-types/1
```

### Фонды товара

#### Добавить фонд к товару
```http
POST /api/products/1/funds
Content-Type: application/json

{
  "fundId": 1,
  "allocationPercentage": 20.0
}
```

#### Обновить процент распределения фонда
```http
PUT /api/products/1/funds/1
Content-Type: application/json

{
  "allocationPercentage": 25.0
}
```

#### Удалить фонд из товара
```http
DELETE /api/products/1/funds/1
```

---

## Справочники

### Материалы

#### Получить список материалов
```http
GET /api/materials
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Доска дубовая 40mm",
      "unit": "м²",
      "price": 2500.00,
      "currency": "RUB",
      "isActive": true,
      "categoryId": 1,
      "category": {
        "name": "Древесина"
      }
    }
  ]
}
```

#### Создать новый материал
```http
POST /api/materials
Content-Type: application/json

{
  "name": "Винты самонарезающие 4x60",
  "unit": "шт",
  "price": 2.50,
  "currency": "RUB",
  "categoryId": 2,
  "isActive": true
}
```

### Виды работ

#### Получить список видов работ
```http
GET /api/work-types
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Столярные работы",
      "description": "Изготовление деревянных изделий",
      "hourlyRate": 800.00,
      "isActive": true,
      "departmentId": 1,
      "department": {
        "name": "Производство"
      }
    }
  ]
}
```

#### Создать новый вид работ
```http
POST /api/work-types
Content-Type: application/json

{
  "name": "Покраска",
  "description": "Нанесение защитного покрытия",
  "hourlyRate": 600.00,
  "departmentId": 1,
  "isActive": true
}
```

### Фонды

#### Получить список фондов
```http
GET /api/funds
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Амортизация оборудования",
      "description": "Износ производственного оборудования",
      "totalAmount": 50000.00,
      "isActive": true,
      "categoryId": 1,
      "category": {
        "name": "Амортизация"
      }
    }
  ]
}
```

#### Создать новый фонд
```http
POST /api/funds
Content-Type: application/json

{
  "name": "Электроэнергия",
  "description": "Затраты на электричество в цеху",
  "totalAmount": 25000.00,
  "categoryId": 2,
  "isActive": true
}
```

### Категории

#### Получить список категорий
```http
GET /api/categories
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Мебель",
      "description": "Мебельные изделия",
      "isActive": true
    }
  ]
}
```

#### Создать новую категорию
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Декор",
  "description": "Декоративные элементы",
  "isActive": true
}
```

---

## Расчетные эндпоинты

### Расчет себестоимости товара
```http
GET /api/products/1/cost-calculation
```

**Ответ:**
```json
{
  "data": {
    "materialsCost": 6250.00,
    "laborCost": 6400.00,
    "overheadCost": 7500.00,
    "totalCost": 20150.00,
    "productionTime": 8.0,
    "breakdown": {
      "materials": [
        {
          "name": "Доска дубовая 40mm",
          "quantity": 2.5,
          "unitPrice": 2500.00,
          "totalCost": 6250.00
        }
      ],
      "workTypes": [
        {
          "name": "Столярные работы",
          "estimatedTime": 8.0,
          "hourlyRate": 800.00,
          "totalCost": 6400.00
        }
      ],
      "funds": [
        {
          "name": "Амортизация оборудования",
          "allocationPercentage": 15.0,
          "fundAmount": 50000.00,
          "allocatedCost": 7500.00
        }
      ]
    }
  }
}
```

### Получить ценовые рекомендации
```http
GET /api/products/1/pricing-recommendations
```

**Ответ:**
```json
{
  "data": {
    "totalCost": 20150.00,
    "currentPrice": 15000.00,
    "recommendations": [
      {
        "margin": 15,
        "recommendedPrice": 23172.50,
        "profit": 3022.50,
        "profitability": "Минимальная"
      },
      {
        "margin": 20,
        "recommendedPrice": 24180.00,
        "profit": 4030.00,
        "profitability": "Низкая"
      },
      {
        "margin": 25,
        "recommendedPrice": 25187.50,
        "profit": 5037.50,
        "profitability": "Оптимальная"
      },
      {
        "margin": 30,
        "recommendedPrice": 26195.00,
        "profit": 6045.00,
        "profitability": "Высокая"
      }
    ],
    "analysis": {
      "currentMargin": -25.7,
      "isProfit": false,
      "profitPerHour": -643.75,
      "recommendation": "⚠️ Цена продажи не покрывает себестоимость. Увеличьте цену или оптимизируйте затраты."
    }
  }
}
```

---

## Обработка ошибок

### Стандартный формат ошибки
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "timestamp": "2025-07-22T10:30:00.000Z"
}
```

### Коды ответов
- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверные данные запроса
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Примеры ошибок

#### Товар не найден
```http
GET /api/products/999
```

**Ответ (404):**
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

#### Неверные данные при создании
```http
POST /api/products
Content-Type: application/json

{
  "name": "",
  "sellingPrice": -100
}
```

**Ответ (400):**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    "Name is required",
    "Selling price must be positive"
  ]
}
```

---

## Пагинация и фильтрация

### Пагинация
```http
GET /api/products?page=2&limit=10
```

**Ответ:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Фильтрация
```http
GET /api/products?category=1&isActive=true&minPrice=1000&maxPrice=10000
```

### Поиск
```http
GET /api/products?search=стол&sortBy=name&sortOrder=asc
```

Эти примеры помогут разработчикам быстро понять, как работать с API системы и интегрировать новые функции.
