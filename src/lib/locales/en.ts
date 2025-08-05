// English language translations
export const en = {
  // Common
  app: {
    name: "FactoryFlow ERP",
    description: "Materials Management System",
    language: "English"
  },
  
  // Navigation
  nav: {
    dashboard: "Dashboard",
    materials: "Materials",
    analytics: "Analytics",
    reports: "Reports",
    users: "Users",
    settings: "Settings"
  },
  
  // Enhanced Search
  search: {
    title: "Search Materials",
    button: "Search",
    search: "Search", // Добавлено для bulk actions
    advanced: "Advanced Search",
    filterBy: "Filter by",
    filters: "filters",
    clearAll: "Clear all",
    clearSearch: "Clear search",
    commandPlaceholder: "Search materials, filters, history...",
    noResults: "No results",
    quickActions: "Quick Actions",
    showFilters: "Show filters",
    searchHistory: "Search history",
    priceRange: "Price range",
    from: "from",
    to: "to",
    searchIn: "Search in",
    searchByCategory: "By category",
    searchByUnit: "By unit",
    searchByPrice: "By price",
    recentSearches: "Recent searches",
    removeFilter: "Remove filter",
    addFilter: "Add filter"
  },
  
  // Materials page
  materials: {
    title: "Materials Management",
    addButton: "Add Material",
    searchPlaceholder: "Search by name, unit or tags...",
    empty: "No materials found",
    loading: "Loading materials...",
    error: "Error loading materials",
    all: "All Materials",
    active: "Active",
    inactive: "Inactive",
    category: "Category",
    categories: "Categories",
    unit: "Unit",
    units: "Units",
    price: "Price",
    currency: "Currency", // Добавлено для bulk actions
    search: {
      button: "Search",
      searching: "Searching...",
      clear: "Clear search",
      results: "Found {count} {suffix} for query \"{query}\"",
      noResults: "No results found for \"{query}\". Try another query.",
      noItems: "No items found for your search",
      suffix: {
        one: "material",
        other: "materials"
      }
    },
    table: {
      name: "Name",
      unit: "Unit",
      price: "Price",
      category: "Group",
      actions: "Actions"
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
      restore: "Restore"
    },
    confirmDelete: {
      title: "Delete Material",
      message: "Are you sure you want to delete this material?",
      confirm: "Delete",
      cancel: "Cancel"
    }
  },
  
  // Material form
  materialForm: {
    addTitle: "Add Material",
    editTitle: "Edit Material",
    addDescription: "Add a new material to the system",
    editDescription: "Update material information",
    fields: {
      name: "Material Name",
      namePlaceholder: "Example: Carbon Steel St3",
      unit: "Unit of Measurement",
      unitPlaceholder: "Select unit of measurement",
      unitNotFound: "Unit not found",
      currency: "Currency",
      currencyPlaceholder: "Select currency",
      currencyNotFound: "Currency not found",
      price: "Price",
      pricePlaceholder: "0.00",
      category: "Group",
      categoryPlaceholder: "Select group",
      categoryNotFound: "Group not found",
      optional: "optional"
    },
    validation: {
      nameRequired: "Name is required",
      unitRequired: "Unit is required",
      pricePositive: "Price must be positive",
      categoryRequired: "Group is required"
    },
    buttons: {
      cancel: "Cancel",
      add: "Add",
      update: "Update",
      saving: "Saving..."
    }
  },
  
  // Categories/Groups
  categories: {
    title: "Material Groups",
    addButton: "Add Group",
    searchPlaceholder: "Search groups...",
    empty: "No groups found",
    loading: "Loading groups...",
    error: "Error loading groups",
    category: "Category", // Добавлено для bulk actions
    table: {
      name: "Name",
      description: "Description",
      materials: "Material Count",
      actions: "Actions"
    },
    actions: {
      edit: "Edit",
      delete: "Delete"
    },
    confirmDelete: {
      title: "Delete Group",
      message: "Are you sure you want to delete this group?",
      confirm: "Delete",
      cancel: "Cancel"
    }
  },
  
  // Category form
  categoryForm: {
    addTitle: "Add Group",
    editTitle: "Edit Group",
    addDescription: "Add a new material group",
    editDescription: "Update group information",
    fields: {
      name: "Group Name",
      namePlaceholder: "Example: Metals",
      description: "Description",
      descriptionPlaceholder: "Group description (optional)"
    },
    validation: {
      nameRequired: "Name is required"
    },
    buttons: {
      cancel: "Cancel",
      add: "Add",
      update: "Update",
      saving: "Saving..."
    }
  },
  
  // Dashboard
  dashboard: {
    title: "Dashboard",
    quickActions: "Quick Actions",
    addMaterial: "Add Material",
    addCategory: "Add Group",
    kpi: {
      totalMaterials: "Total Materials",
      activeCategories: "Active Groups",
      averagePrice: "Average Price",
      totalValue: "Total Value"
    },
    materialsByCategory: "Materials by Group"
  },
  
  // Settings
  settings: {
    title: "Settings",
    language: {
      title: "Language",
      description: "Choose your preferred interface language"
    }
  },

  // Bulk Actions
  bulkActions: {
    selected: "Selected",
    priceActions: "Prices",
    copyActions: "Copy",
    otherActions: "Other",
    increasePricePercent: "Increase price by %",
    decreasePricePercent: "Decrease price by %",
    convertToRub: "Convert to RUB",
    convertToUsd: "Convert to USD",
    copySimple: "Create copies",
    copyToCategory: "Copy to category",
    copyWithChanges: "Copy with changes",
    changeCategory: "Change category",
    exportSelected: "Export selected",
    deactivate: "Deactivate",
    processing: "Processing...",
    success: "Operation completed successfully",
    error: "Error performing operation",
    // Новые переводы для групповых действий
    groupMode: "Group actions",
    allItems: "All items",
    selectedMode: "Selected items",
    switchToGroup: "Switch to group mode",
    switchToSelected: "Switch to selected mode",
    groupModeDescription: "Apply actions to all items matching current filters",
    selectedModeDescription: "Apply actions only to selected items",
    confirmGroupAction: "Are you sure you want to apply this action to all matching items?",
    estimatedCount: "Estimated items affected"
  }
};
