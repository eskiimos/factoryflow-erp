/*
  Миграция для добавления поддержки расчета по единицам измерения
  
  Добавляем поля для:
  - Указания базовой единицы измерения для материалов и работ
  - Коэффициентов пересчета между единицами
  - Нормативных расходов на единицу площади/объема/веса
*/

-- Добавляем поля единиц измерения в MaterialItem
ALTER TABLE "material_items" ADD COLUMN "base_unit" TEXT NOT NULL DEFAULT 'шт';
ALTER TABLE "material_items" ADD COLUMN "calculation_unit" TEXT; -- см², м², м³, кг, м
ALTER TABLE "material_items" ADD COLUMN "conversion_factor" REAL NOT NULL DEFAULT 1.0; -- коэффициент пересчета
ALTER TABLE "material_items" ADD COLUMN "coverage_area" REAL; -- покрытие на м² (для лаков, красок)
ALTER TABLE "material_items" ADD COLUMN "usage_per_unit" REAL; -- расход на единицу товара

-- Добавляем поля единиц измерения в WorkType  
ALTER TABLE "work_types" ADD COLUMN "calculation_unit" TEXT; -- час/м², час/м³, час/кг
ALTER TABLE "work_types" ADD COLUMN "productivity_rate" REAL NOT NULL DEFAULT 1.0; -- производительность на единицу
ALTER TABLE "work_types" ADD COLUMN "time_per_unit" REAL; -- время на единицу измерения товара

-- Модифицируем ProductMaterialUsage для поддержки единиц
ALTER TABLE "product_material_usages" ADD COLUMN "unit_type" TEXT NOT NULL DEFAULT 'fixed'; -- fixed, per_area, per_volume, per_weight
ALTER TABLE "product_material_usages" ADD COLUMN "base_quantity" REAL NOT NULL DEFAULT 0; -- базовое количество на единицу товара
ALTER TABLE "product_material_usages" ADD COLUMN "calculation_formula" TEXT; -- формула расчета: area*thickness, volume*density

-- Модифицируем ProductWorkTypeUsage для поддержки единиц
ALTER TABLE "product_work_type_usages" ADD COLUMN "unit_type" TEXT NOT NULL DEFAULT 'fixed'; -- fixed, per_area, per_volume, per_weight  
ALTER TABLE "product_work_type_usages" ADD COLUMN "base_time" REAL NOT NULL DEFAULT 0; -- базовое время на единицу товара
ALTER TABLE "product_work_type_usages" ADD COLUMN "calculation_formula" TEXT; -- формула расчета времени

-- Добавляем таблицу единиц измерения
CREATE TABLE "measurement_units" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "symbol" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- length, area, volume, weight, count
  "base_unit" TEXT NOT NULL, -- базовая единица для типа
  "conversion_factor" REAL NOT NULL DEFAULT 1.0, -- коэффициент к базовой единице
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Заполняем базовые единицы измерения
INSERT INTO "measurement_units" ("id", "name", "symbol", "type", "base_unit", "conversion_factor") VALUES
('unit_mm', 'Миллиметр', 'мм', 'length', 'м', 0.001),
('unit_cm', 'Сантиметр', 'см', 'length', 'м', 0.01),
('unit_m', 'Метр', 'м', 'length', 'м', 1.0),
('unit_mm2', 'Квадратный миллиметр', 'мм²', 'area', 'м²', 0.000001),
('unit_cm2', 'Квадратный сантиметр', 'см²', 'area', 'м²', 0.0001),
('unit_m2', 'Квадратный метр', 'м²', 'area', 'м²', 1.0),
('unit_mm3', 'Кубический миллиметр', 'мм³', 'volume', 'м³', 0.000000001),
('unit_cm3', 'Кубический сантиметр', 'см³', 'volume', 'м³', 0.000001),
('unit_m3', 'Кубический метр', 'м³', 'volume', 'м³', 1.0),
('unit_g', 'Грамм', 'г', 'weight', 'кг', 0.001),
('unit_kg', 'Килограмм', 'кг', 'weight', 'кг', 1.0),
('unit_pcs', 'Штука', 'шт', 'count', 'шт', 1.0);
