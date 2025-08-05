-- Добавляем поля для размеров и единиц измерения к продуктам
ALTER TABLE products ADD COLUMN length REAL DEFAULT NULL;
ALTER TABLE products ADD COLUMN width REAL DEFAULT NULL;
ALTER TABLE products ADD COLUMN height REAL DEFAULT NULL;
ALTER TABLE products ADD COLUMN weight REAL DEFAULT NULL;
ALTER TABLE products ADD COLUMN area REAL DEFAULT NULL;
ALTER TABLE products ADD COLUMN volume REAL DEFAULT NULL;

-- Единицы измерения для размеров
ALTER TABLE products ADD COLUMN lengthUnit TEXT DEFAULT 'м';
ALTER TABLE products ADD COLUMN weightUnit TEXT DEFAULT 'кг';

-- Связь с таблицей единиц измерения
ALTER TABLE products ADD COLUMN measurementUnitId TEXT DEFAULT NULL;

-- Формулы расчета
ALTER TABLE products ADD COLUMN calculationFormula TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN usageRate REAL DEFAULT NULL;

-- Параметры для автоматического расчета
ALTER TABLE products ADD COLUMN autoCalculateArea INTEGER DEFAULT 0; -- boolean
ALTER TABLE products ADD COLUMN autoCalculateVolume INTEGER DEFAULT 0; -- boolean

-- Добавляем поля к материалам
ALTER TABLE material_items ADD COLUMN measurementUnitId TEXT DEFAULT NULL;
ALTER TABLE material_items ADD COLUMN calculationFormula TEXT DEFAULT NULL;
ALTER TABLE material_items ADD COLUMN usageRatePerUnit REAL DEFAULT NULL;

-- Добавляем поля к видам работ  
ALTER TABLE work_types ADD COLUMN measurementUnitId TEXT DEFAULT NULL;
ALTER TABLE work_types ADD COLUMN calculationFormula TEXT DEFAULT NULL;
ALTER TABLE work_types ADD COLUMN timePerUnitArea REAL DEFAULT NULL;
ALTER TABLE work_types ADD COLUMN timePerUnitVolume REAL DEFAULT NULL;

-- Обновляем поле unit в продуктах до символа единицы измерения
UPDATE products SET unit = 'шт' WHERE unit IS NULL OR unit = '';
UPDATE material_items SET unit = 'шт' WHERE unit IS NULL OR unit = '';
UPDATE work_types SET unit = 'час' WHERE unit IS NULL OR unit = '';
