-- Добавление системы вариантов продуктов

-- Таблица вариантов продуктов
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL, -- например "Лестница 2м с поручнями"
    "sku" TEXT UNIQUE, -- уникальный артикул варианта
    "description" TEXT,
    "specifications" TEXT, -- JSON с характеристиками (размеры, цвет, материал и т.д.)
    "priceModifier" REAL NOT NULL DEFAULT 0, -- модификатор цены (может быть +/- в процентах или фиксированная сумма)
    "priceModifierType" TEXT NOT NULL DEFAULT "PERCENTAGE", -- PERCENTAGE, FIXED
    "costModifier" REAL NOT NULL DEFAULT 0, -- модификатор себестоимости
    "costModifierType" TEXT NOT NULL DEFAULT "PERCENTAGE",
    "productionTimeModifier" REAL NOT NULL DEFAULT 0, -- модификатор времени производства
    "stockQuantity" REAL NOT NULL DEFAULT 0, -- остаток конкретного варианта
    "minStock" REAL NOT NULL DEFAULT 0,
    "maxStock" REAL NOT NULL DEFAULT 0,
    "weight" REAL DEFAULT 0, -- вес для расчета доставки
    "dimensions" TEXT, -- JSON с размерами (длина, ширина, высота)
    "images" TEXT, -- JSON массив изображений варианта
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0, -- для сортировки вариантов
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Таблица характеристик вариантов (для фильтрации и поиска)
CREATE TABLE "variant_attributes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "attributeName" TEXT NOT NULL, -- "размер", "цвет", "материал", "высота", "ширина"
    "attributeValue" TEXT NOT NULL, -- "2м", "красный", "сталь", "200см"
    "attributeType" TEXT NOT NULL DEFAULT "TEXT", -- TEXT, NUMBER, BOOLEAN, SELECT
    "unit" TEXT, -- единица измерения для числовых значений
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "variant_attributes_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Таблица дополнительных опций (комплектующие, услуги)
CREATE TABLE "variant_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL, -- "Дополнительные поручни", "Покраска", "Доставка на этаж"
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT "ADDON", -- ADDON (дополнение), REQUIRED (обязательно), ALTERNATIVE (альтернатива)
    "priceModifier" REAL NOT NULL DEFAULT 0,
    "priceModifierType" TEXT NOT NULL DEFAULT "FIXED", -- PERCENTAGE, FIXED
    "costModifier" REAL NOT NULL DEFAULT 0,
    "costModifierType" TEXT NOT NULL DEFAULT "FIXED",
    "productionTimeModifier" REAL NOT NULL DEFAULT 0, -- дополнительное время в часах
    "isDefault" BOOLEAN NOT NULL DEFAULT false, -- выбрана ли опция по умолчанию
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "variant_options_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");
CREATE INDEX "product_variants_isActive_idx" ON "product_variants"("isActive");
CREATE INDEX "variant_attributes_variantId_idx" ON "variant_attributes"("variantId");
CREATE INDEX "variant_attributes_name_value_idx" ON "variant_attributes"("attributeName", "attributeValue");
CREATE INDEX "variant_options_variantId_idx" ON "variant_options"("variantId");
CREATE INDEX "variant_options_type_idx" ON "variant_options"("type");
