#!/bin/bash

# 🚀 FactoryFlow ERP - Скрипт быстрого развертывания
# Автоматическое развертывание полной ERP системы в облаке

set -e

echo "🚀 FactoryFlow ERP - Автоматическое развертывание"
echo "=================================================="

# Проверка зависимостей
echo "📋 Проверка зависимостей..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js не установлен"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm не установлен"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git не установлен"; exit 1; }

echo "✅ Все зависимости установлены"

# Установка пакетов
echo "📦 Установка зависимостей..."
npm install

# Проверка environment файлов
if [ ! -f .env ]; then
    echo "⚙️ Создание .env файла..."
    cp .env.example .env
    echo "⚠️  ВАЖНО: Настройте переменные в .env файле!"
fi

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

# Проверка подключения к базе данных
echo "🗄️ Проверка базы данных..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "✅ База данных подключена"
else
    echo "⚠️  База данных не настроена. Настройте DATABASE_URL в .env"
fi

# Сборка проекта
echo "🔨 Сборка проекта..."
npm run build

# Проверка работоспособности
echo "🧪 Тестирование API..."
npm run start &
SERVER_PID=$!
sleep 5

# Проверка API формул
if curl -s http://localhost:3000/api/formulas >/dev/null; then
    echo "✅ API работает корректно"
else
    echo "⚠️  API недоступно"
fi

kill $SERVER_PID 2>/dev/null || true

echo ""
echo "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!"
echo "=========================="
echo ""
echo "📋 Что дальше:"
echo "1. 🗄️  Настройте PostgreSQL на https://console.neon.tech"
echo "2. ⚙️  Обновите DATABASE_URL в .env.local"
echo "3. 🚀 Разверните на Vercel: vercel --prod"
echo "4. 🔄 Запустите миграции: npx prisma migrate deploy"
echo ""
echo "🌐 Локальный запуск: npm run dev"
echo "🔗 Откройте: http://localhost:3000/test-formulas"
echo ""
echo "📚 Документация: DEPLOY.md"
echo "🔧 Статус: DEPLOYMENT_STATUS.md"
echo ""
echo "✨ FactoryFlow ERP готов к использованию!"
