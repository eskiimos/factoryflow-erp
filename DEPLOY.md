# 🚀 Деплой FactoryFlow ERP в облако

## Быстрый старт

### 1. Подготовка базы данных

1. **Регистрируемся в Neon.tech** (бесплатная PostgreSQL БД):
   - Переходим на https://neon.tech
   - Создаем аккаунт
   - Создаем новый проект "FactoryFlow ERP"
   - Копируем connection string из дашборда

2. **Альтернативные варианты БД**:
   - Vercel Postgres
   - Supabase
   - PlanetScale
   - Railway

### 2. Деплой на Vercel

1. **Заходим на Vercel.com** и подключаем GitHub репозиторий
2. **Настраиваем переменные окружения**:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   NODE_ENV=production
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   ```
3. **Запускаем деплой** - Vercel автоматически соберет проект

### 3. Инициализация базы данных

После первого деплоя выполните команды в Vercel CLI:

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Переход в проект
cd your-project

# Запуск миграций
vercel env pull .env.local
npx prisma migrate deploy --schema=prisma/schema.production.prisma

# Инициализация данных
npx tsx scripts/init-database.ts
```

## Автоматический деплой

После настройки все изменения будут автоматически разворачиваться при push в GitHub.

## Что включено в деплой

### ✅ Основная система
- Dashboard с KPI карточками и графиками
- Управление продуктами (6-шаговый workflow)
- Система материалов, работ и фондов
- Интеллектуальное ценообразование
- Планирование и фонды

### ✅ Система калькуляторов и формул
- 5 готовых калькуляторов
- Конструктор формул с drag-and-drop
- Сохранение формул в базе данных
- API для работы с формулами

### ✅ Техническая часть
- Next.js 15 с App Router
- PostgreSQL база данных
- Prisma ORM
- shadcn/ui компоненты
- TypeScript
- Tailwind CSS

## Структура API

### Формулы
- `GET /api/formulas` - список всех формул
- `GET /api/formulas/:id` - получить формулу
- `POST /api/formulas` - создать формулу
- `PUT /api/formulas/:id` - обновить формулу
- `DELETE /api/formulas/:id` - удалить формулу

### Продукты
- `GET /api/products` - список продуктов
- `POST /api/products` - создать продукт
- `PUT /api/products/:id` - обновить продукт

### Материалы, работы, фонды
- Стандартные CRUD операции для всех сущностей

## Мониторинг и обслуживание

1. **Логи**: Доступны в дашборде Vercel
2. **Метрики**: Встроенная аналитика Vercel
3. **Резервные копии**: Автоматические бэкапы в Neon.tech
4. **Обновления**: Автоматический деплой из GitHub

## Будущие улучшения

- [ ] Система пользователей и ролей
- [ ] Расширенная аналитика
- [ ] Интеграция с внешними системами
- [ ] Мобильное приложение
- [ ] Система уведомлений

## Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус базы данных в Neon.tech

---
**Готово к использованию!** 🎉
