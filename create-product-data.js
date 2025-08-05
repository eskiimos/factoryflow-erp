const productData = {
  name: "Деревянная лестница премиум-класса",
  description: "Высококачественная деревянная лестница из массива дуба с металлическими крепежами. Подходит для жилых и коммерческих помещений.",
  sku: "LEST-DUB-001",
  unit: "шт",
  type: "PRODUCT",
  
  // Ценообразование
  pricingMethod: "FIXED",
  baseUnit: "шт",
  basePrice: 85000,
  minimumOrder: 1,
  
  // Коэффициенты
  materialRate: 1.0,
  laborRate: 1.0,
  complexityRate: 1.2,
  
  // Производственные данные
  materialCost: 45000,
  laborCost: 25000,
  overheadCost: 8000,
  totalCost: 78000,
  
  // Коммерческие данные
  sellingPrice: 85000,
  margin: 8.97, // (85000 - 78000) / 78000 * 100
  currency: "RUB",
  
  // Время производства
  productionTime: 24, // 24 часа
  
  // Складские данные
  currentStock: 5,
  minStock: 2,
  maxStock: 15,
  
  // Метаданные
  tags: JSON.stringify(["премиум", "дуб", "лестница", "интерьер"]),
  specifications: JSON.stringify({
    material: "Массив дуба",
    height: "2.8м",
    width: "80см",
    steps: 14,
    coating: "Лак матовый",
    handrail: "Деревянный с металлическими вставками",
    weight: "45кг",
    warranty: "2 года"
  }),
  images: JSON.stringify([
    "/uploads/ladder-oak-main.jpg",
    "/uploads/ladder-oak-detail.jpg",
    "/uploads/ladder-oak-installed.jpg"
  ]),
  isActive: true
}

console.log('Данные товара для создания:')
console.log(JSON.stringify(productData, null, 2))
