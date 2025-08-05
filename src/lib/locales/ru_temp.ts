// Russian language translations
export const ru = {
  // Common
  app: {
    name: "FactoryFlow ERP",
    description: "Система управления материалами",
    language: "Русский"
  },
  
  // Navigation
  nav: {
    dashboard: "Дашборд",
    materials: "Материалы",
    analytics: "Аналитика",
    reports: "Отчеты",
    users: "Пользователи",
    settings: "Настройки"
  },
  
  // Enhanced Search
  search: {
    title: "Поиск материалов",
    button: "Найти",
    advanced: "Расширенный поиск",
    filterBy: "Фильтровать по",
    filters: "фильтров",
    clearAll: "Очистить все",
    clearSearch: "Очистить поиск",
    commandPlaceholder: "Поиск материалов, фильтры, история...",
    noResults: "Нет результатов",
    quickActions: "Быстрые действия",
    showFilters: "Показать фильтры",
    searchHistory: "История поиска",
    priceRange: "Диапазон цен",
    from: "от",
    to: "до",
    searchIn: "Искать в",
    searchByCategory: "По категории",
    searchByUnit: "По единице измерения",
    searchByPrice: "По цене",
    recentSearches: "Недавние поиски",
    removeFilter: "Удалить фильтр",
    addFilter: "Добавить фильтр"
  },
  
  // Materials page
  materials: {
    title: "Управление материалами",
    addButton: "Добавить материал",
    searchPlaceholder: "Поиск по названию, ед. изм. или меткам...",
    empty: "Материалы не найдены",
    loading: "Загрузка материалов...",
    error: "Ошибка при загрузке материалов",
    all: "Все материалы",
    active: "Активные",
    inactive: "Неактивные",
    category: "Категория",
    categories: "Категории",
    unit: "Единица измерения",
    units: "Единицы измерения",
    price: "Цена",
    search: {
      button: "Найти",
      searching: "Поиск...",
      clear: "Очистить поиск",
      results: "Найдено {count} {suffix} по запросу \"{query}\"",
      noResults: "По запросу \"{query}\" ничего не найдено. Попробуйте другой запрос.",
      noItems: "По вашему запросу ничего не найдено",
      suffix: {
        one: "материал",
        few: "материала",
        many: "материалов"
      }
    },
    table: {
      name: "Название",
      unit: "Ед. изм.",
      price: "Цена",
      category: "Группа",
      actions: "Действия"
    },
    actions: {
      edit: "Редактировать",
      delete: "Удалить",
      restore: "Восстановить",
      copy: "Копировать"
    },
    confirmDelete: {
      title: "Удалить материал",
      message: "Вы уверены, что хотите удалить этот материал?",
      confirm: "Удалить",
      cancel: "Отмена"
    }
  },
  
  // Material form
  materialForm: {
    addTitle: "Добавить материал",
    editTitle: "Редактировать материал",
    addDescription: "Добавьте новый материал в систему",
    editDescription: "Обновите информацию о материале",
    fields: {
      name: "Название материала",
      namePlaceholder: "Например: Сталь углеродистая Ст3",
      unit: "Единица измерения",
      unitPlaceholder: "Выберите единицу измерения",
      unitNotFound: "Единица измерения не найдена",
      currency: "Валюта",
      currencyPlaceholder: "Выберите валюту",
      currencyNotFound: "Валюта не найдена",
      price: "Цена",
      pricePlaceholder: "0.00",
      category: "Группа",
      categoryPlaceholder: "Выберите группу",
      categoryNotFound: "Группа не найдена",
      optional: "необязательно"
    },
    validation: {
      nameRequired: "Название обязательно",
      unitRequired: "Единица измерения обязательна",
      pricePositive: "Цена должна быть положительной",
      categoryRequired: "Группа обязательна"
    },
    buttons: {
      cancel: "Отмена",
      add: "Добавить",
      update: "Обновить",
      saving: "Сохранение..."
    }
  },
  
  // Categories/Groups
  categories: {
    title: "Группы материалов",
    addButton: "Добавить группу",
    searchPlaceholder: "Поиск групп...",
    empty: "Группы не найдены",
    loading: "Загрузка групп...",
    error: "Ошибка при загрузке групп",
    table: {
      name: "Название",
      description: "Описание",
      materials: "Количество материалов",
      actions: "Действия"
    },
    actions: {
      edit: "Редактировать",
      delete: "Удалить"
    },
    confirmDelete: {
      title: "Удалить группу",
      message: "Вы уверены, что хотите удалить эту группу?",
      confirm: "Удалить",
      cancel: "Отмена"
    }
  },
  
  // Category form
  categoryForm: {
    addTitle: "Добавить группу",
    editTitle: "Редактировать группу",
    addDescription: "Добавьте новую группу материалов",
    editDescription: "Обновите информацию о группе",
    fields: {
      name: "Название группы",
      namePlaceholder: "Например: Металлы",
      description: "Описание",
      descriptionPlaceholder: "Описание группы (необязательно)"
    },
    validation: {
      nameRequired: "Название обязательно"
    },
    buttons: {
      cancel: "Отмена",
      add: "Добавить",
      update: "Обновить",
      saving: "Сохранение..."
    }
  },
  
  // Dashboard
  dashboard: {
    title: "Дашборд",
    quickActions: "Быстрые действия",
    addMaterial: "Добавить материал",
    addCategory: "Добавить группу",
    kpi: {
      totalMaterials: "Всего материалов",
      activeCategories: "Активные группы",
      averagePrice: "Средняя цена",
      totalValue: "Общая стоимость"
    },
    materialsByCategory: "Материалы по группам"
  },
  
  // Settings
  settings: {
    title: "Настройки",
    language: {
      title: "Язык",
      description: "Выберите предпочтительный язык интерфейса"
    }
  },

  // Bulk Actions
  bulkActions: {
    selected: "Выбрано",
    priceActions: "Цены",
    copyActions: "Копирование",
    otherActions: "Другие",
    increasePricePercent: "Увеличить цену на %",
    decreasePricePercent: "Уменьшить цену на %",
    convertToRub: "Пересчитать в рубли",
    convertToUsd: "Пересчитать в доллары",
    copySimple: "Создать копии",
    copyToCategory: "Копировать в категорию",
    copyWithChanges: "Копировать с изменениями",
    changeCategory: "Изменить категорию",
    exportSelected: "Экспортировать",
    deactivate: "Деактивировать",
    processing: "Обработка...",
    success: "Операция выполнена успешно",
    error: "Ошибка при выполнении операции"
  }
};
