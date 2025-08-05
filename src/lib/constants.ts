// Единицы измерения сгруппированные по категориям
export const UNIT_CATEGORIES = {
  WEIGHT: "Вес",
  VOLUME: "Объем",
  LENGTH: "Длина",
  AREA: "Площадь",
  COUNT: "Количество",
  ELECTRICAL: "Электрические",
  TIME: "Время",
  OTHER: "Другие",
};

// Единицы измерения с поддержкой русского и английского языков
export const UNITS_OF_MEASUREMENT = [
  // Вес
  { 
    value: "kg", 
    label: "кг (килограмм)", 
    category: UNIT_CATEGORIES.WEIGHT,
    searchTerms: ["килограмм", "килограммы", "кило", "кг", "kg", "kilogram"]
  },
  { 
    value: "g", 
    label: "г (грамм)", 
    category: UNIT_CATEGORIES.WEIGHT,
    searchTerms: ["грамм", "граммы", "г", "g", "gram"]
  },
  { 
    value: "ton", 
    label: "т (тонна)", 
    category: UNIT_CATEGORIES.WEIGHT,
    searchTerms: ["тонна", "тонны", "т", "ton", "тон"]
  },
  
  // Объем
  { 
    value: "l", 
    label: "л (литр)", 
    category: UNIT_CATEGORIES.VOLUME,
    searchTerms: ["литр", "литры", "л", "l", "liter"]
  },
  { 
    value: "ml", 
    label: "мл (миллилитр)", 
    category: UNIT_CATEGORIES.VOLUME,
    searchTerms: ["миллилитр", "миллилитры", "мл", "ml", "milliliter"]
  },
  { 
    value: "m3", 
    label: "м³ (кубический метр)", 
    category: UNIT_CATEGORIES.VOLUME,
    searchTerms: ["кубометр", "куб", "кубический метр", "м3", "м³", "cubic meter", "кубометры"]
  },
  
  // Длина
  { 
    value: "m", 
    label: "м (метр)", 
    category: UNIT_CATEGORIES.LENGTH,
    searchTerms: ["метр", "метры", "м", "m", "meter"]
  },
  { 
    value: "cm", 
    label: "см (сантиметр)", 
    category: UNIT_CATEGORIES.LENGTH,
    searchTerms: ["сантиметр", "сантиметры", "см", "cm", "centimeter"]
  },
  { 
    value: "mm", 
    label: "мм (миллиметр)", 
    category: UNIT_CATEGORIES.LENGTH,
    searchTerms: ["миллиметр", "миллиметры", "мм", "mm", "millimeter"]
  },
  
  // Площадь
  { 
    value: "m2", 
    label: "м² (квадратный метр)", 
    category: UNIT_CATEGORIES.AREA,
    searchTerms: ["квадратный метр", "кв метр", "кв м", "м2", "м²", "square meter"]
  },
  
  // Штуки
  { 
    value: "pcs", 
    label: "шт (штука)", 
    category: UNIT_CATEGORIES.COUNT,
    searchTerms: ["штука", "штуки", "шт", "pcs", "piece", "штук"]
  },
  { 
    value: "pack", 
    label: "уп (упаковка)", 
    category: UNIT_CATEGORIES.COUNT,
    searchTerms: ["упаковка", "упаковки", "уп", "pack", "package", "упак"]
  },
  { 
    value: "pair", 
    label: "пара", 
    category: UNIT_CATEGORIES.COUNT,
    searchTerms: ["пара", "пары", "pair", "пар"]
  },
  
  // Электрические
  { 
    value: "kW", 
    label: "кВт (киловатт)", 
    category: UNIT_CATEGORIES.ELECTRICAL,
    searchTerms: ["киловатт", "киловатты", "кВт", "kW", "килоВатт"]
  },
  { 
    value: "W", 
    label: "Вт (ватт)", 
    category: UNIT_CATEGORIES.ELECTRICAL,
    searchTerms: ["ватт", "ватты", "Вт", "W", "watt"]
  },
  
  // Время
  { 
    value: "hour", 
    label: "ч (час)", 
    category: UNIT_CATEGORIES.TIME,
    searchTerms: ["час", "часы", "ч", "h", "hour", "часов"]
  },
  
  // Другие
  { 
    value: "set", 
    label: "комплект", 
    category: UNIT_CATEGORIES.OTHER,
    searchTerms: ["комплект", "комплекты", "компл", "set", "набор", "наборы"]
  },
  { 
    value: "roll", 
    label: "рулон", 
    category: UNIT_CATEGORIES.OTHER,
    searchTerms: ["рулон", "рулоны", "roll", "рул"]
  },
  { 
    value: "sheet", 
    label: "лист", 
    category: UNIT_CATEGORIES.OTHER,
    searchTerms: ["лист", "листы", "sheet", "листов"]
  },
];

// Валюты
export const CURRENCIES = [
  { value: "RUB", label: "₽ (рубль)", searchTerms: ["рубль", "рубли", "руб", "₽", "rub", "рубля"] },
  { value: "USD", label: "$ (доллар США)", searchTerms: ["доллар", "доллары", "бакс", "usd", "$", "доллара"] },
  { value: "EUR", label: "€ (евро)", searchTerms: ["евро", "eur", "€"] },
  { value: "CNY", label: "¥ (юань)", searchTerms: ["юань", "юани", "cny", "¥", "юаня", "yuan"] },
];

// Статусы
export const STATUSES = {
  ACTIVE: true,
  INACTIVE: false,
};

// Статусы с переводами
export const STATUS_LABELS = {
  'true': "Активен",
  'false': "Неактивен",
};

// Функция для получения констант (только русский язык)
export function getLocalizedConstants() {
  return {
    unitCategories: UNIT_CATEGORIES,
    currencies: CURRENCIES,
    statusLabels: STATUS_LABELS,
  };
}
