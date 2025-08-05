# FactoryFlow ERP - Complete Production Management System

![FactoryFlow ERP](https://img.shields.io/badge/FactoryFlow-ERP-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-6-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC.svg)

**FactoryFlow ERP** - полнофункциональная система управления производством с пошаговым workflow создания товаров, интеллектуальным ценообразованием и полным расчетом себестоимости. MVP 0.1 включает модули материалов, работ, фондов и автоматического ценообразования.

## 🎯 Ключевые возможности

### 📊 Комплексное управление товарами
- **Пошаговый workflow** создания товаров (6 этапов)
- **Автоматический расчет** себестоимости
- **Интеллектуальное ценообразование** с рекомендациями
- **Управление материалами**, видами работ и фондами
- **Анализ прибыльности** в реальном времени

### � Система ценообразования
- Автоматический расчет на основе всех затрат
- Быстрые кнопки наценки (15%, 20%, 25%, 30%)
- Анализ маржинальности и прибыльности
- Бизнес-рекомендации по ценовой стратегии
- Расчет прибыли за час производства

### 🏭 Производственная аналитика
- Расчет времени производства
- Контроль складских остатков
- Планирование производственных мощностей
- Распределение накладных расходов через фонды

### 🎨 Современный UX/UI
- **Bento Grid Layout** дизайн-система
- **Пошаговые индикаторы** прогресса
- **Адаптивный интерфейс** для всех устройств
- **Интерактивные диалоги** создания ресурсов

## 🛠️ Технологии

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: SQLite (легко мигрировать на PostgreSQL)
- **UI**: shadcn/ui, Tailwind CSS, Lucide React
- **Графики**: Recharts
- **Анимации**: Framer Motion
- **Тестирование**: Vitest, React Testing Library

## 📖 Документация

- **[Руководство по Workflow](./PRODUCT_WORKFLOW_GUIDE.md)** - Подробное описание каждого этапа создания товара
- **[Архитектура системы](./ARCHITECTURE.md)** - Техническая документация и принципы построения
- **[Copilot инструкции](./.github/copilot-instructions.md)** - Настройки для ИИ-ассистента

## 📦 Установка

1. **Клонируйте репозиторий**:
   ```bash
   git clone https://github.com/yourusername/factoryflow-erp.git
   cd factoryflow-erp
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Настройте базу данных**:
   ```bash
   # Создайте миграции
   npm run db:migrate
   
   # Заполните базу тестовыми данными
   npm run db:seed
   ```

4. **Запустите в режиме разработки**:
   ```bash
   npm run dev
   ```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🎯 Структура проекта

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API маршруты
│   │   ├── products/        # API товаров
│   │   ├── materials/       # API материалов
│   │   ├── work-types/      # API видов работ
│   │   ├── funds/           # API фондов
│   │   └── categories/      # API категорий
│   ├── products/            # Страницы товаров
│   ├── materials/           # Страницы материалов
│   ├── globals.css          # Глобальные стили
│   ├── layout.tsx           # Корневой лейаут
│   └── page.tsx             # Главная страница (Дашборд)
├── components/              # React компоненты
│   ├── ui/                  # shadcn/ui компоненты
│   ├── edit-product-page.tsx # Главный компонент редактирования товара
│   ├── add-material-dialog.tsx # Диалог добавления материала
│   ├── add-work-type-dialog.tsx # Диалог добавления вида работ
│   ├── add-fund-dialog.tsx  # Диалог добавления фонда
│   └── dashboard.tsx        # Компонент дашборда
├── lib/                     # Утилиты
│   └── utils.ts             # Вспомогательные функции
└── data/                    # Константы и справочники
    └── constants.ts         # Константы системы
```

## 🚀 Быстрый старт для разработчиков

### 1. Понимание Workflow товаров
Система построена вокруг **6-этапного процесса** создания товара:

1. **🔵 Основное** - Базовая информация + изображение товара
2. **🔵 Материалы** - Сырье и комплектующие с расчетом стоимости
3. **🔵 Работы** - Виды работ и время производства
4. **🔵 Фонды** - Распределение накладных расходов
5. **🔵 Ценообразование** - Автоматический расчет цены с рекомендациями
6. **🔵 Настройки** - Производственные параметры и складские остатки

### 2. Основные компоненты для изучения
- `/src/components/edit-product-page.tsx` - Главный компонент с табами
- `/src/app/api/products/[id]/route.ts` - API для товаров
- `/prisma/schema.prisma` - Схема базы данных

### 3. Система расчетов
```typescript
// Полная себестоимость
totalCost = materialsCost + laborCost + overheadCost

// Рекомендуемая цена  
recommendedPrice = totalCost * (1 + marginPercentage / 100)

// Анализ прибыльности
profit = sellingPrice - totalCost
profitPerHour = profit / productionTime
```
├── lib/                  # Утилиты и типы
│   ├── types.ts          # TypeScript типы
│   └── utils.ts          # Вспомогательные функции
└── test/                 # Тестовые файлы
    └── setup.ts          # Настройка тестов
```

## 📊 База данных
## 📚 Полная документация

### Для разработчиков
- **[🚀 GETTING_STARTED.md](./GETTING_STARTED.md)** - Первые шаги для новых разработчиков
- **[📋 PRODUCT_WORKFLOW_GUIDE.md](./PRODUCT_WORKFLOW_GUIDE.md)** - Подробное описание workflow создания товаров
- **[🏗️ ARCHITECTURE.md](./ARCHITECTURE.md)** - Архитектурные решения и принципы
- **[🔌 API_EXAMPLES.md](./API_EXAMPLES.md)** - Примеры использования API

### Для пользователей
- **[📖 USER_GUIDE.md](./USER_GUIDE.md)** - Руководство пользователя *(планируется)*
- **[💼 BUSINESS_FEATURES.md](./BUSINESS_FEATURES.md)** - Бизнес-возможности системы *(планируется)*

### Техническая документация
- **[⚙️ Copilot Instructions](./.github/copilot-instructions.md)** - Настройки для ИИ-ассистента
- **[🗄️ Схема базы данных](./prisma/schema.prisma)** - Полная схема Prisma

---

## ⚡ Быстрый старт

### Для пользователей
1. Откройте систему в браузере
2. Перейдите в раздел "Товары" → "Создать товар"
3. Следуйте пошаговому процессу создания

### Для разработчиков
```bash
git clone https://github.com/yourusername/factoryflow-erp.git
cd factoryflow-erp
npm install && npm run db:setup && npm run dev
```
**📖 Обязательно прочитайте [GETTING_STARTED.md](./GETTING_STARTED.md)**

---

## 📝 Доступные скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run start` - Запуск продакшен сервера
- `npm run lint` - Линтинг кода
- `npm run db:migrate` - Создание миграций
- `npm run db:seed` - Заполнение базы данных
- `npm run db:studio` - Открытие Prisma Studio

## 🗺️ Roadmap

- **v0.1** ✅ Модуль "Материалы"
- **v0.2** 🔄 Модуль "Виды работ"
- **v0.3** 📋 Склад и инвентарь
- **v1.0** 🎯 Заказы и полный функционал

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Коммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Пушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - детали в файле [LICENSE](LICENSE)

## 💡 Поддержка

Если у вас есть вопросы или предложения:
- 🐛 [Создайте issue](https://github.com/yourusername/factoryflow-erp/issues)
- 💬 [Начните обсуждение](https://github.com/yourusername/factoryflow-erp/discussions)

---

**FactoryFlow ERP** - делаем управление материалами простым и эффективным! 🚀
