#!/bin/bash

# FactoryFlow ERP - Настройка PostgreSQL через Docker

echo "🐳 Настройка PostgreSQL через Docker"
echo "===================================="

# Проверяем установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не найден. Установите Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker найден"

# Останавливаем существующий контейнер если есть
docker stop factoryflow-postgres 2>/dev/null || true
docker rm factoryflow-postgres 2>/dev/null || true

echo "🚀 Запускаем PostgreSQL в Docker..."

# Запускаем PostgreSQL контейнер
docker run -d \
  --name factoryflow-postgres \
  -e POSTGRES_DB=factoryflow_dev \
  -e POSTGRES_USER=factoryflow \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  postgres:15

echo "⏳ Ждем запуска PostgreSQL..."
sleep 5

echo "📝 Создаем .env.local для Docker..."

# Создаем .env.local файл
cat > .env.local << 'EOF'
# Docker PostgreSQL
DATABASE_URL="postgresql://factoryflow:password123@localhost:5432/factoryflow_dev"

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
echo "🎉 Готово! PostgreSQL в Docker настроен"
echo ""
echo "📋 Полезные команды:"
echo "  npm run dev                    - Запуск с PostgreSQL"
echo "  npm run db:studio              - Открыть Prisma Studio"
echo "  docker exec -it factoryflow-postgres psql -U factoryflow factoryflow_dev"
echo "  docker stop factoryflow-postgres   - Остановить контейнер"
echo "  docker start factoryflow-postgres  - Запустить контейнер"
echo ""
echo "🔗 Строка подключения:"
echo "  postgresql://factoryflow:password123@localhost:5432/factoryflow_dev"
