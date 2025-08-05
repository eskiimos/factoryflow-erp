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
    workTypes: "Виды работ",
    employees: "Сотрудники",
    analytics: "Аналитика",
    reports: "Отчеты",
    users: "Пользователи",
    settings: "Настройки"
  },
  
  // Enhanced Search
  search: {
    title: "Поиск материалов",
    button: "Найти",
    search: "Поиск", // Добавлено для bulk actions
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
    currency: "Валюта", // Добавлено для bulk actions
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
      stock: "Остаток",
      status: "Статус",
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
      
      // Управление запасами
      currentStock: "Текущий остаток",
      currentStockPlaceholder: "Количество на складе",
      criticalMinimum: "Критический минимум",
      criticalMinimumPlaceholder: "Минимальное количество",
      satisfactoryLevel: "Удовлетворительный уровень",
      satisfactoryLevelPlaceholder: "Оптимальное количество",
      
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
  
  // Inventory management
  inventory: {
    title: "Управление запасами",
    status: {
      empty: "Товар закончился",
      critical: "Критический минимум", 
      low: "Низкий уровень",
      satisfactory: "Удовлетворительно",
      good: "Хорошо"
    },
    labels: {
      currentStock: "Текущий остаток",
      criticalMinimum: "Критический минимум",
      satisfactoryLevel: "Удовлетворительный уровень",
      needsAttention: "Требует внимания",
      inStock: "В наличии",
      outOfStock: "Нет в наличии"
    },
    actions: {
      updateStock: "Обновить остаток",
      addStock: "Добавить товар",
      removeStock: "Списать товар",
      setLevels: "Установить уровни"
    },
    filters: {
      all: "Все товары",
      critical: "Критический минимум",
      low: "Низкий уровень",
      needsAttention: "Требует внимания",
      inStock: "В наличии",
      outOfStock: "Нет в наличии"
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
    category: "Категория", // Добавлено для bulk actions
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
  },

  // Work Types page
  workTypes: {
    title: "Управление видами работ",
    addButton: "Добавить вид работы",
    searchPlaceholder: "Поиск по названию работы, отделу или оборудованию...",
    table: {
      name: "Название работы",
      department: "Отдел",
      unit: "Единица",
      standardTime: "Норматив",
      hourlyRate: "Ставка",
      skillLevel: "Квалификация",
      status: "Статус",
      actions: "Действия"
    },
    filters: {
      department: "Отдел",
      skillLevel: "Квалификация",
      rateRange: "Диапазон ставки"
    },
    search: {
      results: "Найдено {count} {suffix} по запросу \"{query}\"",
      noResults: "По запросу \"{query}\" ничего не найдено"
    }
  },

  // Work Type Form
  workTypeForm: {
    addTitle: "Добавить вид работы",
    editTitle: "Редактировать вид работы",
    name: "Название работы",
    namePlaceholder: "Введите название работы",
    description: "Описание",
    descriptionPlaceholder: "Описание выполняемых операций",
    department: "Отдел",
    departmentPlaceholder: "Выберите отдел",
    unit: "Единица измерения",
    unitPlaceholder: "Выберите единицу",
    standardTime: "Нормативное время",
    standardTimePlaceholder: "Часов на единицу",
    hourlyRate: "Тарифная ставка",
    hourlyRatePlaceholder: "Рублей в час",
    skillLevel: "Уровень квалификации",
    skillLevelPlaceholder: "Выберите уровень",
    equipmentRequired: "Требуемое оборудование",
    equipmentPlaceholder: "Список необходимого оборудования",
    safetyRequirements: "Требования безопасности",
    safetyPlaceholder: "Требования по технике безопасности",
    isActive: "Активен",
    submit: "Сохранить",
    cancel: "Отмена",
    validation: {
      nameRequired: "Название работы обязательно",
      unitRequired: "Единица измерения обязательна",
      standardTimeRequired: "Нормативное время обязательно",
      standardTimeMin: "Нормативное время должно быть больше 0",
      hourlyRateRequired: "Тарифная ставка обязательна",
      hourlyRateMin: "Тарифная ставка должна быть больше 0",
      skillLevelRequired: "Уровень квалификации обязателен"
    }
  },

  // Employees page
  employees: {
    title: "Управление сотрудниками",
    addButton: "Добавить сотрудника",
    searchPlaceholder: "Поиск по ФИО, должности или табельному номеру...",
    table: {
      personnelNumber: "Табельный №",
      fullName: "ФИО",
      position: "Должность",
      department: "Отдел",
      skillLevel: "Квалификация",
      hourlyRate: "Ставка",
      status: "Статус",
      actions: "Действия"
    },
    filters: {
      department: "Отдел",
      position: "Должность",
      skillLevel: "Квалификация",
      status: "Статус"
    },
    search: {
      results: "Найдено {count} {suffix} по запросу \"{query}\"",
      noResults: "По запросу \"{query}\" ничего не найдено"
    }
  },

  // Employee Form
  employeeForm: {
    addTitle: "Добавить сотрудника",
    editTitle: "Редактировать данные сотрудника",
    personnelNumber: "Табельный номер",
    personnelNumberPlaceholder: "Уникальный номер сотрудника",
    firstName: "Имя",
    firstNamePlaceholder: "Введите имя",
    lastName: "Фамилия",
    lastNamePlaceholder: "Введите фамилию",
    middleName: "Отчество",
    middleNamePlaceholder: "Введите отчество",
    position: "Должность",
    positionPlaceholder: "Введите должность",
    department: "Отдел",
    departmentPlaceholder: "Выберите отдел",
    skillLevel: "Уровень квалификации",
    skillLevelPlaceholder: "Выберите уровень",
    hourlyRate: "Часовая ставка",
    hourlyRatePlaceholder: "Рублей в час",
    hireDate: "Дата приема",
    phone: "Телефон",
    phonePlaceholder: "+7 (999) 123-45-67",
    email: "Email",
    emailPlaceholder: "email@example.com",
    status: "Статус",
    statusPlaceholder: "Выберите статус",
    isActive: "Активен",
    submit: "Сохранить",
    cancel: "Отмена",
    validation: {
      personnelNumberRequired: "Табельный номер обязателен",
      firstNameRequired: "Имя обязательно",
      lastNameRequired: "Фамилия обязательна",
      positionRequired: "Должность обязательна",
      skillLevelRequired: "Уровень квалификации обязателен",
      hourlyRateRequired: "Часовая ставка обязательна",
      hourlyRateMin: "Часовая ставка должна быть больше 0",
      hireDateRequired: "Дата приема обязательна",
      statusRequired: "Статус обязателен",
      emailInvalid: "Некорректный email адрес"
    }
  },

  // Departments
  departments: {
    title: "Управление отделами",
    addButton: "Добавить отдел",
    name: "Название отдела",
    namePlaceholder: "Введите название отдела",
    description: "Описание",
    descriptionPlaceholder: "Описание деятельности отдела",
    isActive: "Активен",
    validation: {
      nameRequired: "Название отдела обязательно"
    }
  },

  // Skill Levels
  skillLevels: {
    trainee: "Стажер",
    worker: "Рабочий",
    specialist: "Специалист",
    expert: "Эксперт"
  },

  // Employee Statuses
  employeeStatuses: {
    active: "Активен",
    vacation: "Отпуск",
    sickLeave: "Больничный",
    dismissed: "Уволен"
  },

  // Work Units
  workUnits: {
    hour: "час",
    shift: "смена",
    piece: "шт",
    sqMeter: "м²",
    cuMeter: "м³",
    kg: "кг",
    operation: "операция"
  }
};
