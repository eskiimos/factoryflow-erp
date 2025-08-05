const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function loadMaterials() {
  try {
    console.log('📦 Загружаем новые материалы...')
    
    // Сначала создаем категории
    const categories = [
      { name: 'Крепёж', description: 'Крепежные элементы и фурнитура' },
      { name: 'Расходники (Сборка в цеху)', description: 'Расходные материалы для сборки' },
      { name: 'Электрика', description: 'Электротехнические материалы' },
      { name: 'АКП', description: 'Алюминиевые композитные панели' },
      { name: 'Светодиоды и блоки питания', description: 'Светодиодное оборудование' },
      { name: 'Акрил', description: 'Акриловые материалы' },
      { name: 'ПВХ', description: 'ПВХ материалы' }
    ]

    console.log('🏷️ Создаем категории...')
    const createdCategories = {}
    for (const cat of categories) {
      const category = await prisma.category.create({
        data: cat
      })
      createdCategories[cat.name] = category.id
      console.log(`✅ Создана категория: ${cat.name}`)
    }

    // Теперь создаем материалы
    const materials = [
      {
        name: 'Саморез 19 мм с пресс-шайбой',
        unit: 'шт',
        price: 0.45,
        categoryId: createdCategories['Крепёж'],
        currentStock: 5000,
        criticalMinimum: 500,
        satisfactoryLevel: 2000
      },
      {
        name: 'Стрейч-плёнка',
        unit: 'пог. м',
        price: 0.94,
        categoryId: createdCategories['Расходники (Сборка в цеху)'],
        currentStock: 1500,
        criticalMinimum: 200,
        satisfactoryLevel: 500
      },
      {
        name: 'Ветош',
        unit: 'кг',
        price: 106.18,
        categoryId: createdCategories['Расходники (Сборка в цеху)'],
        currentStock: 50,
        criticalMinimum: 5,
        satisfactoryLevel: 20
      },
      {
        name: 'Клемма Ваго 3е',
        unit: 'шт',
        price: 22.18,
        categoryId: createdCategories['Электрика'],
        currentStock: 200,
        criticalMinimum: 20,
        satisfactoryLevel: 80
      },
      {
        name: 'Распред коробка 65х65',
        unit: 'шт',
        price: 57.90,
        categoryId: createdCategories['Электрика'],
        currentStock: 100,
        criticalMinimum: 10,
        satisfactoryLevel: 40
      },
      {
        name: 'Провод швв 2х0,5мм',
        unit: 'пог. м',
        price: 23.79,
        categoryId: createdCategories['Электрика'],
        currentStock: 500,
        criticalMinimum: 50,
        satisfactoryLevel: 200
      },
      {
        name: 'Провод швв 2х1,5мм',
        unit: 'пог. м',
        price: 37.85,
        categoryId: createdCategories['Электрика'],
        currentStock: 300,
        criticalMinimum: 30,
        satisfactoryLevel: 120
      },
      {
        name: 'Гофра 16д',
        unit: 'пог. м',
        price: 8.63,
        categoryId: createdCategories['Электрика'],
        currentStock: 800,
        criticalMinimum: 100,
        satisfactoryLevel: 300
      },
      {
        name: 'АКП 3мм',
        unit: 'м2',
        price: 1464.82,
        categoryId: createdCategories['АКП'],
        currentStock: 25,
        criticalMinimum: 3,
        satisfactoryLevel: 10
      },
      {
        name: 'Блок питания 150 вт (стоимость за 1вт)',
        unit: 'вт',
        price: 12.13,
        categoryId: createdCategories['Светодиоды и блоки питания'],
        currentStock: 1000,
        criticalMinimum: 150,
        satisfactoryLevel: 500
      },
      {
        name: 'Акрил 2мм (Молоч.)',
        unit: 'м2',
        price: 1238.31,
        categoryId: createdCategories['Акрил'],
        currentStock: 15,
        criticalMinimum: 2,
        satisfactoryLevel: 8
      },
      {
        name: 'Пвх 8 мм (Цветной)',
        unit: 'м2',
        price: 1691.32,
        categoryId: createdCategories['ПВХ'],
        currentStock: 12,
        criticalMinimum: 2,
        satisfactoryLevel: 6
      },
      {
        name: 'Саморез 2.5х16',
        unit: 'шт',
        price: 0.29,
        categoryId: createdCategories['Крепёж'],
        currentStock: 8000,
        criticalMinimum: 800,
        satisfactoryLevel: 3000
      },
      {
        name: 'Светодиодная лента 12 вт',
        unit: 'пог. м',
        price: 238.07,
        categoryId: createdCategories['Светодиоды и блоки питания'],
        currentStock: 200,
        criticalMinimum: 20,
        satisfactoryLevel: 80
      },
      {
        name: 'Клей (космофен) 50 гр (цена за 1 см) цена 382',
        unit: 'мг',
        price: 6.86,
        categoryId: createdCategories['Расходники (Сборка в цеху)'],
        currentStock: 5000,
        criticalMinimum: 500,
        satisfactoryLevel: 2000
      }
    ]

    console.log('📦 Создаем материалы...')
    let createdCount = 0
    for (const material of materials) {
      const createdMaterial = await prisma.materialItem.create({
        data: {
          ...material,
          currency: 'RUB',
          isActive: true
        }
      })
      createdCount++
      console.log(`✅ Создан материал: ${material.name} - ${material.price} руб/${material.unit}`)
    }

    console.log(`🎉 Загружено ${createdCount} материалов в ${categories.length} категорий!`)
    console.log(`📊 Все материалы имеют складские остатки и готовы к использованию`)
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке материалов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

loadMaterials()
