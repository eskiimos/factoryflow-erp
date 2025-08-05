-- Добавляем поддержку блочной архитектуры товаров
-- Это расширение к существующей схеме

-- Блоки для конструктора товаров
CREATE TABLE product_blocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('MATERIALS', 'WORK_TYPES', 'OPTIONS', 'FORMULAS')),
  category TEXT, -- 'wood', 'metal', 'finishing', etc.
  icon TEXT, -- Иконка для UI
  config JSON NOT NULL, -- Конфигурация блока
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- Системные блоки нельзя удалять
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Шаблоны из блоков
CREATE TABLE product_templates_from_blocks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  blocks JSON NOT NULL, -- Массив ID блоков и их конфигурация
  generated_template_id TEXT, -- Ссылка на сгенерированный Template
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_template_id) REFERENCES templates(id)
);

-- Добавляем поле в products для хранения блочной структуры
ALTER TABLE products ADD COLUMN constructor_blocks JSON;
ALTER TABLE products ADD COLUMN auto_template_id TEXT;
ALTER TABLE products ADD CONSTRAINT fk_products_auto_template 
  FOREIGN KEY (auto_template_id) REFERENCES templates(id);

-- Вставляем несколько базовых блоков для демонстрации
INSERT INTO product_blocks (id, name, description, type, category, icon, config) VALUES 
('block_wood_materials', 'Деревянные материалы', 'Стандартный набор пиломатериалов', 'MATERIALS', 'wood', 'TreePine', '{
  "materials": [
    {
      "materialCode": "BOARD_50x200",
      "name": "Доска 50x200мм",
      "quantityFormula": "length * width / 10000 * thickness / 50",
      "wastePercent": 10,
      "unit": "м3"
    },
    {
      "materialCode": "PLYWOOD_18",
      "name": "Фанера 18мм",
      "quantityFormula": "area * 0.018",
      "wastePercent": 5,
      "unit": "м3"
    }
  ]
}'),

('block_metal_materials', 'Металлические материалы', 'Металлопрокат и метизы', 'MATERIALS', 'metal', 'Wrench', '{
  "materials": [
    {
      "materialCode": "STEEL_SHEET_3",
      "name": "Лист стальной 3мм",
      "quantityFormula": "area * 0.003 * 7850",
      "wastePercent": 15,
      "unit": "кг"
    },
    {
      "materialCode": "STEEL_PIPE_40",
      "name": "Труба стальная 40мм",
      "quantityFormula": "length",
      "wastePercent": 5,
      "unit": "м"
    }
  ]
}'),

('block_woodwork', 'Столярные работы', 'Базовые виды столярных работ', 'WORK_TYPES', 'wood', 'Hammer', '{
  "workTypes": [
    {
      "workTypeCode": "CUTTING_WOOD",
      "name": "Распиловка древесины",
      "timeFormula": "area * 0.5",
      "skillLevel": "Рабочий",
      "unit": "час"
    },
    {
      "workTypeCode": "ASSEMBLY_WOOD",
      "name": "Сборка деревянной конструкции",
      "timeFormula": "complexity_factor * base_time",
      "skillLevel": "Специалист",
      "unit": "час"
    }
  ]
}'),

('block_basic_options', 'Базовые параметры', 'Стандартные параметры для большинства изделий', 'OPTIONS', 'universal', 'Settings', '{
  "parameters": [
    {
      "code": "length",
      "name": "Длина",
      "type": "NUMBER",
      "unit": "мм",
      "minValue": 100,
      "maxValue": 10000,
      "defaultValue": 2000
    },
    {
      "code": "width", 
      "name": "Ширина",
      "type": "NUMBER",
      "unit": "мм",
      "minValue": 100,
      "maxValue": 5000,
      "defaultValue": 800
    },
    {
      "code": "height",
      "name": "Высота", 
      "type": "NUMBER",
      "unit": "мм",
      "minValue": 50,
      "maxValue": 3000,
      "defaultValue": 200
    },
    {
      "code": "material_grade",
      "name": "Сорт материала",
      "type": "SELECT",
      "options": ["Эконом", "Стандарт", "Премиум"],
      "defaultValue": "Стандарт"
    }
  ]
}');

-- Создаем индексы для производительности
CREATE INDEX idx_product_blocks_type ON product_blocks(type);
CREATE INDEX idx_product_blocks_category ON product_blocks(category);
CREATE INDEX idx_product_blocks_active ON product_blocks(is_active);
