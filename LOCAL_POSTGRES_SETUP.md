# 🐘 Локальная разработка с PostgreSQL

Есть 3 способа запустить PostgreSQL локально для разработки:

## 🎯 Вариант 1: Homebrew (Рекомендуется для macOS)

**Автоматическая установка:**
```bash
./scripts/setup-local-postgres.sh
```

**Ручная установка:**
```bash
# Установить PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Создать базу данных
createdb factoryflow_dev

# Создать .env.local
echo 'DATABASE_URL="postgresql://$(whoami)@localhost:5432/factoryflow_dev"' > .env.local
echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"' >> .env.local

# Применить миграции и данные
npm run db:migrate
npm run db:seed
```

---

## 🐳 Вариант 2: Docker (Универсальный)

**С автоматическим скриптом:**
```bash
./scripts/setup-docker-postgres.sh
```

**С Docker Compose (рекомендуется):**
```bash
# Запустить только PostgreSQL
docker-compose up -d postgres

# Создать .env.local
echo 'DATABASE_URL="postgresql://factoryflow:password123@localhost:5432/factoryflow_dev"' > .env.local
echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"' >> .env.local

# Применить миграции и данные
npm run db:migrate
npm run db:seed

# Опционально: запустить pgAdmin для управления БД
docker-compose --profile admin up -d pgadmin
# Доступен на http://localhost:5050
# Email: admin@factoryflow.com, Password: admin123
```

---

## ☁️ Вариант 3: Облачная база (Самый простой)

**Neon.tech (бесплатно):**
1. Перейти на https://neon.tech
2. Создать проект `factoryflow-dev`
3. Скопировать connection string
4. Создать `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@host/database"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```
5. Применить миграции:
```bash
npm run db:migrate
npm run db:seed
```

---

## 🚀 Запуск проекта

После настройки любого варианта:

```bash
# Запуск в режиме разработки
npm run dev

# Открыть Prisma Studio для просмотра данных
npm run db:studio
```

---

## 📋 Полезные команды для работы с БД

```bash
# Миграции
npm run db:migrate          # Применить миграции (dev)
npm run db:migrate:prod      # Применить миграции (prod)
npm run db:push             # Быстрое обновление схемы

# Данные
npm run db:seed             # Заполнить тестовыми данными
npm run db:init             # Инициализация БД

# Инструменты
npm run db:studio           # Prisma Studio
npm run db:generate         # Генерация Prisma Client
```

---

## 🔧 Управление сервисами

### Homebrew PostgreSQL:
```bash
brew services start postgresql@15    # Запустить
brew services stop postgresql@15     # Остановить
brew services restart postgresql@15  # Перезапустить
psql factoryflow_dev                  # Подключиться к БД
```

### Docker:
```bash
docker-compose up -d postgres        # Запустить
docker-compose stop                  # Остановить
docker-compose restart               # Перезапустить
docker exec -it factoryflow-postgres psql -U factoryflow factoryflow_dev
```

---

## 🔍 Проверка подключения

```bash
# Проверить что PostgreSQL работает
psql -c "SELECT version();"

# Проверить подключение приложения
npm run dev
# Открыть http://localhost:3000
```

---

## 💡 Рекомендации

- **Для разработки**: Используйте Homebrew PostgreSQL
- **Для команды**: Используйте Docker Compose  
- **Для быстрого старта**: Используйте Neon.tech
- **Файл `.env.local`** имеет приоритет над `.env`
- **Не коммитьте** `.env.local` в Git (уже в .gitignore)
