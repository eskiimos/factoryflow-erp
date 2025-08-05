// Демонстрационные данные для модуля финансового планирования
export const demoFinancialData = {
  salesForecast: {
    averageCheck: 15000,
    leadsPerMonth: 644,
    conversionRate: 50,
    dealCycleDays: 15,
    calculatedSalesPerMonth: 322,
    sixMonthForecast: 9660000
  },
  
  expenseCategories: [
    {
      name: "Фонд оплаты труда",
      percentage: 35.2,
      color: "#3B82F6",
      items: [
        "Зарплата руководителей",
        "Зарплата специалистов", 
        "Зарплата рабочих",
        "Премиальный фонд",
        "Социальные взносы (30%)",
        "Больничные и отпускные"
      ]
    },
    {
      name: "Сырье и материалы",
      percentage: 17.5,
      color: "#10B981",
      items: [
        "Металлопрокат",
        "Крепежные изделия",
        "Сварочные материалы",
        "Электрокомпоненты",
        "Упаковка",
        "Транспортные расходы"
      ]
    },
    {
      name: "Налоги и взносы",
      percentage: 14.0,
      color: "#F59E0B",
      items: [
        "НДС (20%)",
        "Налог на прибыль",
        "Страховые взносы",
        "Налог на имущество",
        "Транспортный налог"
      ]
    },
    {
      name: "Постоянные расходы",
      percentage: 12.8,
      color: "#EF4444",
      items: [
        "Аренда помещений",
        "Коммунальные услуги",
        "Охрана и безопасность",
        "Связь и интернет",
        "Страхование",
        "Банковские услуги"
      ]
    },
    {
      name: "Маркетинг и продажи",
      percentage: 8.5,
      color: "#8B5CF6",
      items: [
        "Реклама в интернете",
        "Выставки и конференции",
        "Печатная реклама",
        "Командировки",
        "Представительские расходы"
      ]
    },
    {
      name: "Развитие и инвестиции",
      percentage: 6.0,
      color: "#06B6D4",
      items: [
        "Новое оборудование",
        "Модернизация",
        "Обучение персонала",
        "IT-системы",
        "Сертификация"
      ]
    }
  ],
  
  kpiMetrics: {
    profitability: 6.0, // Рентабельность в процентах
    roi: 24.5, // Возврат инвестиций
    breakEvenMonths: 3.2, // Срок окупаемости в месяцах
    cashFlowPositive: true // Положительный денежный поток
  },
  
  industryBenchmarks: {
    manufacturing: {
      laborCosts: "30-40%",
      materials: "15-25%",
      overhead: "10-15%",
      profitMargin: "5-10%"
    }
  }
}

export const russianBusinessTerms = {
  finance: "Финансы",
  budget: "Бюджет", 
  forecast: "Прогноз",
  expenses: "Расходы",
  revenue: "Выручка",
  profit: "Прибыль",
  salesForecast: "Прогноз продаж",
  expenseCategories: "Категории расходов",
  analytics: "Аналитика",
  kpi: "КПЭ (Ключевые показатели эффективности)",
  roi: "ROI (Возврат инвестиций)",
  profitability: "Рентабельность",
  breakEven: "Точка безубыточности",
  cashFlow: "Денежный поток"
}
