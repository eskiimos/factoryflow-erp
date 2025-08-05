const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedMeasurementUnits() {
  console.log('🔧 Добавляем единицы измерения...')

  const units = [
    // Длина
    { name: 'Миллиметр', symbol: 'мм', type: 'length', baseUnit: 'м', conversionFactor: 0.001 },
    { name: 'Сантиметр', symbol: 'см', type: 'length', baseUnit: 'м', conversionFactor: 0.01 },
    { name: 'Метр', symbol: 'м', type: 'length', baseUnit: 'м', conversionFactor: 1.0 },
    
    // Площадь
    { name: 'Квадратный миллиметр', symbol: 'мм²', type: 'area', baseUnit: 'м²', conversionFactor: 0.000001 },
    { name: 'Квадратный сантиметр', symbol: 'см²', type: 'area', baseUnit: 'м²', conversionFactor: 0.0001 },
    { name: 'Квадратный метр', symbol: 'м²', type: 'area', baseUnit: 'м²', conversionFactor: 1.0 },
    
    // Объем
    { name: 'Кубический миллиметр', symbol: 'мм³', type: 'volume', baseUnit: 'м³', conversionFactor: 0.000000001 },
    { name: 'Кубический сантиметр', symbol: 'см³', type: 'volume', baseUnit: 'м³', conversionFactor: 0.000001 },
    { name: 'Литр', symbol: 'л', type: 'volume', baseUnit: 'м³', conversionFactor: 0.001 },
    { name: 'Кубический метр', symbol: 'м³', type: 'volume', baseUnit: 'м³', conversionFactor: 1.0 },
    
    // Вес
    { name: 'Грамм', symbol: 'г', type: 'weight', baseUnit: 'кг', conversionFactor: 0.001 },
    { name: 'Килограмм', symbol: 'кг', type: 'weight', baseUnit: 'кг', conversionFactor: 1.0 },
    { name: 'Тонна', symbol: 'т', type: 'weight', baseUnit: 'кг', conversionFactor: 1000.0 },
    
    // Счетные
    { name: 'Штука', symbol: 'шт', type: 'count', baseUnit: 'шт', conversionFactor: 1.0 },
    { name: 'Упаковка', symbol: 'упак', type: 'count', baseUnit: 'шт', conversionFactor: 1.0 },
    { name: 'Комплект', symbol: 'компл', type: 'count', baseUnit: 'шт', conversionFactor: 1.0 },
  ]

  for (const unit of units) {
    try {
      await prisma.measurementUnit.upsert({
        where: { name: unit.name },
        update: unit,
        create: unit,
      })
      console.log(`✅ ${unit.name} (${unit.symbol})`)
    } catch (error) {
      console.error(`❌ Ошибка при добавлении ${unit.name}:`, error.message)
    }
  }

  console.log('🎉 Единицы измерения добавлены!')
}

async function main() {
  try {
    await seedMeasurementUnits()
  } catch (error) {
    console.error('Ошибка при seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
