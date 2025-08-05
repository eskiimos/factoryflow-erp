-- Сначала создаем тестовые категории, если их нет
INSERT OR IGNORE INTO categories (id, name, description, isActive, createdAt, updatedAt) VALUES 
('wood-cat', 'Деревянные изделия', 'Категория для деревянных материалов и изделий', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('metal-cat', 'Металлические изделия', 'Категория для металлических материалов и изделий', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('universal-cat', 'Универсальные', 'Универсальные блоки для всех типов товаров', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Вставляем блоки MATERIALS
INSERT OR IGNORE INTO product_blocks (id, name, description, type, category, config, isActive, updatedAt) VALUES 
('block-wood-materials', 'Деревянные материалы', 'Основные пиломатериалы: доски, брус, фанера', 'MATERIALS', 'wood', '{"materials": [{"materialId": "1", "baseQuantity": 1, "formula": "length * width * thickness / 1000000"}, {"materialId": "2", "baseQuantity": 0.5, "formula": "perimeter * 0.05"}]}', true, CURRENT_TIMESTAMP),

('block-metal-materials', 'Металлические материалы', 'Металлопрокат: уголки, трубы, листы', 'MATERIALS', 'metal', '{"materials": [{"materialId": "3", "baseQuantity": 1, "formula": "length * weight_per_meter"}, {"materialId": "4", "baseQuantity": 2, "formula": "joint_count * 1"}]}', true, CURRENT_TIMESTAMP),

('block-fasteners', 'Крепежные элементы', 'Саморезы, болты, гайки', 'MATERIALS', 'universal', '{"materials": [{"materialId": "5", "baseQuantity": 10, "formula": "surface_area * 5"}, {"materialId": "6", "baseQuantity": 4, "formula": "joint_count * 2"}]}', true, CURRENT_TIMESTAMP);

-- Вставляем блоки WORK_TYPES  
INSERT OR IGNORE INTO product_blocks (id, name, description, type, category, config, isActive, updatedAt) VALUES 
('block-wood-work', 'Столярные работы', 'Распиловка, строгание, сборка деревянных изделий', 'WORK_TYPES', 'wood', '{"workTypes": [{"workTypeId": "1", "baseTime": 1, "formula": "complexity * base_time"}, {"workTypeId": "2", "baseTime": 0.5, "formula": "surface_area * 0.1"}]}', true, CURRENT_TIMESTAMP),

('block-metal-work', 'Слесарные работы', 'Резка, сварка, обработка металла', 'WORK_TYPES', 'metal', '{"workTypes": [{"workTypeId": "3", "baseTime": 2, "formula": "weld_length * 0.2"}, {"workTypeId": "4", "baseTime": 1, "formula": "hole_count * 0.1"}]}', true, CURRENT_TIMESTAMP),

('block-assembly', 'Сборочные работы', 'Финальная сборка и монтаж', 'WORK_TYPES', 'universal', '{"workTypes": [{"workTypeId": "5", "baseTime": 1, "formula": "component_count * 0.3"}, {"workTypeId": "6", "baseTime": 0.5, "formula": "complexity * 0.5"}]}', true, CURRENT_TIMESTAMP);

-- Вставляем блоки OPTIONS
INSERT OR IGNORE INTO product_blocks (id, name, description, type, category, config, isActive, updatedAt) VALUES 
('block-dimensions', 'Габаритные размеры', 'Длина, ширина, высота изделия', 'OPTIONS', 'universal', '{"parameters": [{"name": "length", "label": "Длина (мм)", "type": "number", "min": 100, "max": 5000, "default": 1000}, {"name": "width", "label": "Ширина (мм)", "type": "number", "min": 50, "max": 2000, "default": 200}, {"name": "height", "label": "Высота (мм)", "type": "number", "min": 10, "max": 500, "default": 25}]}', true, CURRENT_TIMESTAMP),

('block-wood-options', 'Параметры дерева', 'Порода, влажность, класс обработки', 'OPTIONS', 'wood', '{"parameters": [{"name": "wood_type", "label": "Порода дерева", "type": "select", "options": ["Сосна", "Ель", "Березa", "Дуб"], "default": "Сосна"}, {"name": "moisture", "label": "Влажность (%)", "type": "number", "min": 8, "max": 20, "default": 12}]}', true, CURRENT_TIMESTAMP),

('block-metal-options', 'Параметры металла', 'Марка стали, толщина покрытия', 'OPTIONS', 'metal', '{"parameters": [{"name": "steel_grade", "label": "Марка стали", "type": "select", "options": ["Ст3", "09Г2С", "40Х"], "default": "Ст3"}, {"name": "coating", "label": "Покрытие", "type": "select", "options": ["Без покрытия", "Оцинковка", "Порошковая покраска"], "default": "Без покрытия"}]}', true, CURRENT_TIMESTAMP);

-- Вставляем блоки FORMULAS
INSERT OR IGNORE INTO product_blocks (id, name, description, type, category, config, isActive, updatedAt) VALUES 
('block-area-formulas', 'Площадные расчеты', 'Площадь поверхности, периметр', 'FORMULAS', 'universal', '{"formulas": [{"name": "surface_area", "label": "Площадь поверхности", "expression": "2 * (length * width + length * height + width * height)", "unit": "мм²"}, {"name": "perimeter", "label": "Периметр", "expression": "2 * (length + width)", "unit": "мм"}]}', true, CURRENT_TIMESTAMP),

('block-volume-formulas', 'Объемные расчеты', 'Объем, масса, количество досок', 'FORMULAS', 'universal', '{"formulas": [{"name": "volume", "label": "Объем", "expression": "length * width * height", "unit": "мм³"}, {"name": "board_count", "label": "Количество досок", "expression": "ceil(width / 100)", "unit": "шт"}]}', true, CURRENT_TIMESTAMP),

('block-weight-formulas', 'Весовые расчеты', 'Масса конструкции', 'FORMULAS', 'universal', '{"formulas": [{"name": "weight", "label": "Масса", "expression": "volume * density / 1000000", "unit": "кг"}, {"name": "load_capacity", "label": "Несущая способность", "expression": "width * height * strength_coefficient", "unit": "кг"}]}', true, CURRENT_TIMESTAMP);
