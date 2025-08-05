# 🚀 Инструкция по деплою FactoryFlow ERP на Vercel

## ✅ Исправленные проблемы:

### 1. ✅ Исправлен неправильный порт
- **Было**: `http://localhost:3001`
- **Стало**: `http://localhost:3000`
- **Файл**: `src/app/categories/[id]/page.tsx`

### 2. ✅ Настроена конфигурация для PostgreSQL

---

## 🗄️ Шаг 1: Настройка базы данных PostgreSQL

### Вариант A: Neon (Рекомендуется)
1. Перейти на https://neon.tech
2. Создать бесплатный аккаунт
3. Создать новый проект `factoryflow-erp`
4. Скопировать строку подключения

### Вариант B: Supabase
1. Перейти на https://supabase.com
2. Создать бесплатный аккаунт
3. Создать новый проект `factoryflow-erp`
4. Перейти в Settings → Database
5. Скопировать Connection string

---

## ⚙️ Шаг 2: Настройка Vercel

1. Перейти на https://vercel.com/dashboard
2. Выбрать проект `factoryflow-erp`
3. Перейти в Settings → Environment Variables
4. Добавить переменные для **Production**:

```
DATABASE_URL = postgresql://username:password@host:5432/database
NEXT_PUBLIC_BASE_URL = https://your-app-name.vercel.app
```

---

## 🚀 Шаг 3: Деплой

### Автоматический деплой:
```bash
git add .
git commit -m "feat: настройка PostgreSQL для продакшена"
git push origin main
```

### Ручной деплой через CLI:
```bash
npm install -g vercel
vercel --prod
```

---

## 🧪 Шаг 4: Проверка

После деплоя проверить:
1. ✅ Главная страница загружается
2. ✅ API эндпоинты работают (`/api/products`, `/api/materials`)
3. ✅ База данных подключена (проверить через интерфейс)

---

## 🔧 Локальное тестирование с PostgreSQL

Для тестирования локально с PostgreSQL:

1. Создать файл `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@host:5432/database"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

2. Применить миграции:
```bash
npm run db:migrate:prod
npm run db:seed
```

3. Запустить проект:
```bash
npm run dev
```

---

## 📋 Команды для работы с БД

```bash
# Генерация Prisma Client
npm run db:generate

# Применение миграций (разработка)
npm run db:migrate

# Применение миграций (продакшен)
npm run db:migrate:prod

# Заполнение базы тестовыми данными
npm run db:seed

# Открыть Prisma Studio
npm run db:studio

# Полный деплой с миграциями
npm run deploy
```

---

## 🎯 Результат

✅ **Критические проблемы исправлены:**
- Порт API изменен с 3001 на 3000
- Настроена конфигурация PostgreSQL для продакшена
- Добавлены переменные окружения
- Обновлен конфиг Vercel

🚀 **Проект готов к деплою на Vercel!**
