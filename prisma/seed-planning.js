const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedPlanningData() {
  console.log('🌱 Seeding planning data...')

  try {
    // Создаем бюджетные планы
    const budgetPlan1 = await prisma.budgetPlan.create({
      data: {
        name: 'Бюджет Q1 2024',
        description: 'Квартальный бюджетный план на первый квартал 2024 года',
        planType: 'QUARTERLY',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'ACTIVE',
        totalRevenue: 2500000,
        totalCosts: 1800000,
        materialCosts: 1200000,
        laborCosts: 600000,
        overheadCosts: 200000,
        targetProfit: 500000
      }
    })

    const budgetPlan2 = await prisma.budgetPlan.create({
      data: {
        name: 'Годовой бюджет 2024',
        description: 'Основной бюджетный план на 2024 год',
        planType: 'ANNUAL',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'DRAFT',
        totalRevenue: 12000000,
        totalCosts: 8500000,
        materialCosts: 5500000,
        laborCosts: 2500000,
        overheadCosts: 1000000,
        targetProfit: 2500000
      }
    })

    // Создаем категории бюджета для первого плана
    await prisma.budgetCategory.createMany({
      data: [
        {
          budgetPlanId: budgetPlan1.id,
          name: 'Маркетинг и реклама',
          categoryType: 'EXPENSE',
          plannedAmount: 150000,
          actualAmount: 120000
        },
        {
          budgetPlanId: budgetPlan1.id,
          name: 'Офисные расходы',
          categoryType: 'EXPENSE',
          plannedAmount: 80000,
          actualAmount: 75000
        },
        {
          budgetPlanId: budgetPlan1.id,
          name: 'Основные продажи',
          categoryType: 'INCOME',
          plannedAmount: 2300000,
          actualAmount: 2100000
        }
      ]
    })

    // Создаем прогнозы продаж
    const salesForecast1 = await prisma.salesForecast.create({
      data: {
        budgetPlanId: budgetPlan1.id,
        name: 'Прогноз продаж Q1 2024',
        forecastType: 'PRODUCT_BASED',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        periodType: 'MONTHLY',
        totalQuantity: 1500,
        totalRevenue: 2300000,
        averagePrice: 1533,
        growthRate: 15,
        seasonality: 1.2,
        marketTrend: 1.1,
        confidence: 'HIGH',
        methodology: 'Анализ исторических данных с учетом сезонности и рыночных трендов',
        notes: 'Прогноз основан на росте спроса в первом квартале'
      }
    })

    const salesForecast2 = await prisma.salesForecast.create({
      data: {
        name: 'Прогноз по категориям 2024',
        forecastType: 'CATEGORY_BASED',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        periodType: 'QUARTERLY',
        totalQuantity: 8000,
        totalRevenue: 11500000,
        averagePrice: 1437,
        growthRate: 8,
        seasonality: 1.0,
        marketTrend: 1.05,
        confidence: 'MEDIUM',
        methodology: 'Прогнозирование по категориям товаров с учетом исторических данных',
        notes: 'Консервативный прогноз на весь год'
      }
    })

    // Получаем некоторые продукты для создания прогнозов по товарам
    const products = await prisma.product.findMany({
      take: 3,
      where: { isActive: true }
    })

    if (products.length > 0) {
      // Создаем прогнозы продаж по товарам
      const productForecasts = products.map((product, index) => ({
        salesForecastId: salesForecast1.id,
        productId: product.id,
        plannedQuantity: 500 + (index * 200),
        plannedRevenue: (500 + (index * 200)) * (product.sellingPrice || 1000),
        plannedPrice: product.sellingPrice || 1000,
        actualQuantity: 400 + (index * 150),
        actualRevenue: (400 + (index * 150)) * (product.sellingPrice || 1000),
        actualPrice: product.sellingPrice || 1000,
        priority: index === 0 ? 'HIGH' : index === 1 ? 'MEDIUM' : 'LOW',
        notes: `Прогноз для товара ${product.name}`
      }))

      await prisma.productSalesForecast.createMany({
        data: productForecasts
      })
    }

    // Получаем категории для создания прогнозов по категориям
    const categories = await prisma.category.findMany({
      take: 2,
      where: { isActive: true }
    })

    if (categories.length > 0) {
      // Создаем прогнозы продаж по категориям
      const categoryForecasts = categories.map((category, index) => ({
        salesForecastId: salesForecast2.id,
        categoryId: category.id,
        plannedQuantity: 2000 + (index * 1000),
        plannedRevenue: (2000 + (index * 1000)) * 1500,
        actualQuantity: 1800 + (index * 900),
        actualRevenue: (1800 + (index * 900)) * 1500,
        notes: `Прогноз для категории ${category.name}`
      }))

      await prisma.categorySalesForecast.createMany({
        data: categoryForecasts
      })
    }

    console.log('✅ Planning data seeded successfully!')
    console.log(`📊 Created:`)
    console.log(`   - ${2} budget plans`)
    console.log(`   - ${3} budget categories`)
    console.log(`   - ${2} sales forecasts`)
    if (products.length > 0) {
      console.log(`   - ${products.length} product forecasts`)
    }
    if (categories.length > 0) {
      console.log(`   - ${categories.length} category forecasts`)
    }

  } catch (error) {
    console.error('❌ Error seeding planning data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedPlanningData()
}

module.exports = { seedPlanningData }
