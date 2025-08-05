#!/bin/bash

# Переключатель между SQLite и PostgreSQL

echo "🔄 Переключатель баз данных FactoryFlow ERP"
echo "=========================================="

case "$1" in
  "sqlite")
    echo "📦 Переключаюсь на SQLite..."
    
    # Восстанавливаем SQLite схему
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    
    # Восстанавливаем SQLite миграции
    if [ -d "prisma/migrations.sqlite" ]; then
      rm -rf prisma/migrations
      mv prisma/migrations.sqlite prisma/migrations
    fi
    
    # Используем .env для SQLite
    if [ -f ".env.local" ]; then
      mv .env.local .env.postgres
    fi
    
    echo "✅ Переключен на SQLite"
    echo "🔗 DATABASE_URL: file:./dev.db"
    ;;
    
  "postgres")
    echo "🐘 Переключаюсь на PostgreSQL..."
    
    # Устанавливаем PostgreSQL схему
    sed 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.sqlite.prisma > prisma/schema.prisma
    
    # Сохраняем SQLite миграции и удаляем их
    if [ -d "prisma/migrations" ] && [ ! -d "prisma/migrations.sqlite" ]; then
      mv prisma/migrations prisma/migrations.sqlite
    fi
    
    # Используем .env.local для PostgreSQL
    if [ -f ".env.postgres" ]; then
      mv .env.postgres .env.local
    elif [ ! -f ".env.local" ]; then
      echo 'DATABASE_URL="postgresql://bahtiarmingazov@localhost:5432/factoryflow_dev"' > .env.local
      echo 'NEXT_PUBLIC_BASE_URL="http://localhost:3000"' >> .env.local
      echo 'NODE_ENV=development' >> .env.local
    fi
    
    echo "✅ Переключен на PostgreSQL"
    echo "🔗 DATABASE_URL: postgresql://bahtiarmingazov@localhost:5432/factoryflow_dev"
    ;;
    
  *)
    echo "Использование: $0 [sqlite|postgres]"
    echo ""
    echo "Текущая конфигурация:"
    if grep -q "sqlite" prisma/schema.prisma; then
      echo "📦 База данных: SQLite"
    else
      echo "🐘 База данных: PostgreSQL"
    fi
    
    if [ -f ".env.local" ]; then
      echo "📄 Файл конфигурации: .env.local"
      echo "🔗 DATABASE_URL: $(grep DATABASE_URL .env.local)"
    else
      echo "📄 Файл конфигурации: .env"
      echo "🔗 DATABASE_URL: $(grep DATABASE_URL .env)"
    fi
    
    echo ""
    echo "Команды:"
    echo "  $0 sqlite    - переключиться на SQLite"
    echo "  $0 postgres  - переключиться на PostgreSQL"
    ;;
esac
