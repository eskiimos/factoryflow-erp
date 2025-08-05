#!/bin/bash

# FactoryFlow ERP - Локальная настройка PostgreSQL

echo "🐘 Настройка PostgreSQL для локальной разработки"
echo "=============================================="

# Проверяем установлен ли PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL не найден. Устанавливаем через Homebrew..."
    brew install postgresql@15
    brew services start postgresql@15
    echo "✅ PostgreSQL установлен и запущен"
else
    echo "✅ PostgreSQL уже установлен"
fi

# Проверяем запущен ли сервис
if ! brew services list | grep postgresql | grep started &> /dev/null; then
    echo "🚀 Запускаем PostgreSQL сервис..."
    brew services start postgresql@15
    echo "✅ PostgreSQL запущен"
else
    echo "✅ PostgreSQL уже запущен"
fi

echo ""
echo "🗄️ Создаем базу данных для разработки..."

# Создаем базу данных
createdb factoryflow_dev 2>/dev/null || echo "ℹ️  База данных factoryflow_dev уже существует"

echo ""
echo "📝 Создаем .env.local для локальной разработки..."

# Создаем .env.local файл
cat > .env.local << 'EOF'
# Локальная база данных PostgreSQL
DATABASE_URL="postgresql://$(whoami)@localhost:5432/factoryflow_dev"

# Base URL для локальной разработки
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Окружение
NODE_ENV=development
EOF

echo "✅ Файл .env.local создан"

echo ""
echo "🔄 Применяем миграции..."

# Применяем миграции
npm run db:migrate

echo ""
echo "🌱 Заполняем базу тестовыми данными..."

# Заполняем базу данных
npm run db:seed

echo ""
echo "🎉 Готово! PostgreSQL настроен для локальной разработки"
echo ""
echo "📋 Полезные команды:"
echo "  npm run dev              - Запуск с PostgreSQL"
echo "  npm run db:studio        - Открыть Prisma Studio"
echo "  psql factoryflow_dev     - Подключиться к БД"
echo "  brew services stop postgresql@15  - Остановить PostgreSQL"
echo "  brew services start postgresql@15 - Запустить PostgreSQL"
echo ""
echo "🔗 Строка подключения:"
echo "  postgresql://$(whoami)@localhost:5432/factoryflow_dev"
