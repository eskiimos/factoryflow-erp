-- Инициализация базы данных PostgreSQL для FactoryFlow ERP
-- Этот файл выполняется автоматически при первом запуске контейнера

-- Создаем расширения которые могут понадобиться
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создаем схему для приложения (опционально)
-- CREATE SCHEMA IF NOT EXISTS factoryflow;

-- Логирование успешной инициализации
DO $$
BEGIN
    RAISE NOTICE 'FactoryFlow ERP database initialized successfully!';
END $$;
