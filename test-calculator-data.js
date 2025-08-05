// Скрипт для создания тестовых данных калькулятора заказов
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  console.log('Создание тестовых данных для калькулятора заказов...')

  try {
    // 1. Создаем тестовые товары с формульным модулем
    
    // Товар 1: Лестница металлическая (с формулой по высоте)
    const ladder = await prisma.product.create({
      data: {
        name: 'Лестница металлическая',
        description: 'Металлическая лестница с поручнями, высота рассчитывается по формуле',
        sku: 'LADDER-001',
        unit: 'шт',
        basePrice: 15000,
        formulaEnabled: true,
        formulaExpression: 'height * 1500 + width * 500', // высота * 1500 + ширина * 500
        materialCost: 8000,
        laborCost: 5000,
        overheadCost: 2000,
        totalCost: 15000,
        sellingPrice: 18000,
        margin: 20,
      }
    })

    // Параметры для лестницы
    await prisma.productParameter.createMany({
      data: [
        {
          productId: ladder.id,
          name: 'height',
          type: 'NUMBER',
          unit: 'м',
          defaultValue: '3',
          minValue: 1,
          maxValue: 10,
          isRequired: true,
          sortOrder: 1,
          description: 'Высота лестницы'
        },
        {
          productId: ladder.id,
          name: 'width',
          type: 'NUMBER',
          unit: 'м',
          defaultValue: '1',
          minValue: 0.5,
          maxValue: 3,
          isRequired: true,
          sortOrder: 2,
          description: 'Ширина лестницы'
        }
      ]
    })

    // Товар 2: Баннер рекламный (с формулой по площади и тиражу)
    const banner = await prisma.product.create({
      data: {
        name: 'Баннер рекламный',
        description: 'Рекламный баннер, стоимость рассчитывается по площади и тиражу',
        sku: 'BANNER-001',
        unit: 'шт',
        basePrice: 1000,
        formulaEnabled: true,
        formulaExpression: '(width * height / 10000) * quantity', // (ширина * высота / 10000) * тираж
        materialCost: 500,
        laborCost: 300,
        overheadCost: 200,
        totalCost: 1000,
        sellingPrice: 1500,
        margin: 50,
      }
    })

    // Параметры для баннера
    await prisma.productParameter.createMany({
      data: [
        {
          productId: banner.id,
          name: 'width',
          type: 'NUMBER',
          unit: 'см',
          defaultValue: '100',
          minValue: 10,
          maxValue: 1000,
          isRequired: true,
          sortOrder: 1,
          description: 'Ширина баннера в сантиметрах'
        },
        {
          productId: banner.id,
          name: 'height',
          type: 'NUMBER',
          unit: 'см',
          defaultValue: '70',
          minValue: 10,
          maxValue: 1000,
          isRequired: true,
          sortOrder: 2,
          description: 'Высота баннера в сантиметрах'
        },
        {
          productId: banner.id,
          name: 'quantity',
          type: 'NUMBER',
          unit: 'шт',
          defaultValue: '1',
          minValue: 1,
          maxValue: 10000,
          isRequired: true,
          sortOrder: 3,
          description: 'Тираж (количество экземпляров)'
        }
      ]
    })

    // Товар 3: Простой товар без формул
    const simpleProduct = await prisma.product.create({
      data: {
        name: 'Стол офисный',
        description: 'Стандартный офисный стол',
        sku: 'TABLE-001',
        unit: 'шт',
        basePrice: 5000,
        formulaEnabled: false,
        materialCost: 3000,
        laborCost: 1500,
        overheadCost: 500,
        totalCost: 5000,
        sellingPrice: 7000,
        margin: 40,
      }
    })

    // 2. Создаем материалы для товаров
    const materials = await prisma.materialItem.createMany({
      data: [
        {
          name: 'Сталь листовая 3мм',
          unit: 'кг',
          price: 85,
          baseUnit: 'кг',
          calculationUnit: 'кг',
          conversionFactor: 1,
        },
        {
          name: 'Краска по металлу',
          unit: 'л',
          price: 450,
          baseUnit: 'л',
          calculationUnit: 'м²',
          conversionFactor: 8, // 1 литр на 8 м²
        },
        {
          name: 'Материал баннерный',
          unit: 'м²',
          price: 120,
          baseUnit: 'м²',
          calculationUnit: 'см²',
          conversionFactor: 0.0001, // 1 см² = 0.0001 м²
        }
      ]
    })

    // 3. Создаем виды работ
    const workTypes = await prisma.workType.createMany({
      data: [
        {
          name: 'Сварочные работы',
          unit: 'час',
          standardTime: 1,
          hourlyRate: 800,
          skillLevel: 'Специалист',
          description: 'Сварка металлоконструкций'
        },
        {
          name: 'Покрасочные работы',
          unit: 'м²',
          standardTime: 0.5,
          hourlyRate: 600,
          skillLevel: 'Рабочий',
          description: 'Покраска металлических изделий'
        },
        {
          name: 'Печать широкоформатная',
          unit: 'м²',
          standardTime: 0.1,
          hourlyRate: 300,
          skillLevel: 'Оператор',
          description: 'Печать на широкоформатном принтере'
        }
      ]
    })

    console.log('✅ Тестовые данные созданы успешно!')
    console.log('Созданные товары:')
    console.log('- Лестница металлическая (с формулой)')
    console.log('- Баннер рекламный (с формулой)')
    console.log('- Стол офисный (без формулы)')
    console.log('')
    console.log('Теперь можно протестировать калькулятор заказов!')

  } catch (error) {
    console.error('❌ Ошибка создания тестовых данных:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()
