const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCupboardMaterials() {
  console.log('🚀 Добавление материалов для шкафа-купе...');

  // Создаем категории если их нет
  const categories = [
    { name: 'Плитные материалы', description: 'ЛДСП, МДФ, фанера' },
    { name: 'Кромочные материалы', description: 'ПВХ кромка, меламин' },
    { name: 'Фурнитура', description: 'Петли, ручки, направляющие' },
    { name: 'Системы купе', description: 'Профили, ролики, направляющие для раздвижных дверей' },
    { name: 'Наполнение', description: 'Зеркала, стекла, ДВП' },
    { name: 'Крепеж', description: 'Саморезы, конфирматы, стяжки' },
    { name: 'Отделочные материалы', description: 'Лаки, краски, пленки' }
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    });
  }

  const categoriesFromDB = await prisma.category.findMany();
  const getCategoryId = (name) => categoriesFromDB.find(c => c.name === name)?.id;

  // Материалы для шкафа-купе
  const materials = [
    // Плитные материалы
    {
      name: 'ЛДСП 16мм белый',
      unit: 'м²',
      price: 1850.00,
      categoryId: getCategoryId('Плитные материалы'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 45.5,
      criticalMinimum: 10.0,
      satisfactoryLevel: 25.0,
      tags: JSON.stringify(['мебель', 'шкаф', 'основа'])
    },
    {
      name: 'ЛДСП 16мм дуб сонома',
      unit: 'м²',
      price: 2150.00,
      categoryId: getCategoryId('Плитные материалы'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 32.0,
      criticalMinimum: 8.0,
      satisfactoryLevel: 20.0,
      tags: JSON.stringify(['мебель', 'шкаф', 'декор'])
    },
    {
      name: 'ЛДСП 16мм венге',
      unit: 'м²',
      price: 2250.00,
      categoryId: getCategoryId('Плитные материалы'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 28.5,
      criticalMinimum: 8.0,
      satisfactoryLevel: 20.0,
      tags: JSON.stringify(['мебель', 'шкаф', 'декор'])
    },
    {
      name: 'ДВП 3мм белый',
      unit: 'м²',
      price: 450.00,
      categoryId: getCategoryId('Плитные материалы'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 85.0,
      criticalMinimum: 15.0,
      satisfactoryLevel: 40.0,
      tags: JSON.stringify(['мебель', 'задняя стенка'])
    },

    // Кромочные материалы
    {
      name: 'Кромка ПВХ 0.4мм белая',
      unit: 'м',
      price: 25.00,
      categoryId: getCategoryId('Кромочные материалы'),
      baseUnit: 'м',
      calculationUnit: 'м',
      conversionFactor: 1.0,
      currentStock: 250.0,
      criticalMinimum: 50.0,
      satisfactoryLevel: 150.0,
      tags: JSON.stringify(['кромка', 'отделка'])
    },
    {
      name: 'Кромка ПВХ 0.4мм дуб сонома',
      unit: 'м',
      price: 28.00,
      categoryId: getCategoryId('Кромочные материалы'),
      baseUnit: 'м',
      calculationUnit: 'м',
      conversionFactor: 1.0,
      currentStock: 180.0,
      criticalMinimum: 40.0,
      satisfactoryLevel: 120.0,
      tags: JSON.stringify(['кромка', 'отделка', 'декор'])
    },
    {
      name: 'Кромка ПВХ 2мм белая',
      unit: 'м',
      price: 45.00,
      categoryId: getCategoryId('Кромочные материалы'),
      baseUnit: 'м',
      calculationUnit: 'м',
      conversionFactor: 1.0,
      currentStock: 120.0,
      criticalMinimum: 25.0,
      satisfactoryLevel: 80.0,
      tags: JSON.stringify(['кромка', 'видимые торцы'])
    },

    // Системы купе
    {
      name: 'Профиль верхний для купе 2м',
      unit: 'шт',
      price: 890.00,
      categoryId: getCategoryId('Системы купе'),
      baseUnit: 'шт',
      calculationUnit: 'м',
      conversionFactor: 0.5, // 1 шт = 2м
      currentStock: 25.0,
      criticalMinimum: 5.0,
      satisfactoryLevel: 15.0,
      tags: JSON.stringify(['профиль', 'купе', 'направляющая'])
    },
    {
      name: 'Профиль нижний для купе 2м',
      unit: 'шт',
      price: 650.00,
      categoryId: getCategoryId('Системы купе'),
      baseUnit: 'шт',
      calculationUnit: 'м',
      conversionFactor: 0.5,
      currentStock: 25.0,
      criticalMinimum: 5.0,
      satisfactoryLevel: 15.0,
      tags: JSON.stringify(['профиль', 'купе', 'направляющая'])
    },
    {
      name: 'Ролик для раздвижных дверей',
      unit: 'шт',
      price: 125.00,
      categoryId: getCategoryId('Системы купе'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 48.0,
      criticalMinimum: 16.0,
      satisfactoryLevel: 32.0,
      tags: JSON.stringify(['ролик', 'купе', 'механизм'])
    },
    {
      name: 'Стопор для раздвижных дверей',
      unit: 'шт',
      price: 85.00,
      categoryId: getCategoryId('Системы купе'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 32.0,
      criticalMinimum: 8.0,
      satisfactoryLevel: 20.0,
      tags: JSON.stringify(['стопор', 'купе'])
    },

    // Наполнение дверей
    {
      name: 'Зеркало 4мм',
      unit: 'м²',
      price: 1250.00,
      categoryId: getCategoryId('Наполнение'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 12.5,
      criticalMinimum: 3.0,
      satisfactoryLevel: 8.0,
      tags: JSON.stringify(['зеркало', 'наполнение', 'купе'])
    },
    {
      name: 'Стекло лакобель белое 4мм',
      unit: 'м²',
      price: 1850.00,
      categoryId: getCategoryId('Наполнение'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 8.5,
      criticalMinimum: 2.0,
      satisfactoryLevel: 6.0,
      tags: JSON.stringify(['стекло', 'лакобель', 'наполнение'])
    },
    {
      name: 'Стекло с пескоструйным рисунком',
      unit: 'м²',
      price: 2450.00,
      categoryId: getCategoryId('Наполнение'),
      baseUnit: 'м²',
      calculationUnit: 'м²',
      conversionFactor: 1.0,
      currentStock: 5.5,
      criticalMinimum: 1.0,
      satisfactoryLevel: 4.0,
      tags: JSON.stringify(['стекло', 'пескоструй', 'декор'])
    },

    // Фурнитура
    {
      name: 'Полкодержатель регулируемый',
      unit: 'шт',
      price: 45.00,
      categoryId: getCategoryId('Фурнитура'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 150.0,
      criticalMinimum: 40.0,
      satisfactoryLevel: 100.0,
      tags: JSON.stringify(['полкодержатель', 'регулируемый'])
    },
    {
      name: 'Штанга для одежды хром 1м',
      unit: 'шт',
      price: 350.00,
      categoryId: getCategoryId('Фурнитура'),
      baseUnit: 'шт',
      calculationUnit: 'м',
      conversionFactor: 1.0,
      currentStock: 28.0,
      criticalMinimum: 8.0,
      satisfactoryLevel: 20.0,
      tags: JSON.stringify(['штанга', 'хром', 'одежда'])
    },
    {
      name: 'Выдвижной ящик 400мм',
      unit: 'компл',
      price: 1250.00,
      categoryId: getCategoryId('Фурнитура'),
      baseUnit: 'компл',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 15.0,
      criticalMinimum: 3.0,
      satisfactoryLevel: 10.0,
      tags: JSON.stringify(['ящик', 'выдвижной', 'направляющие'])
    },
    {
      name: 'Доводчик для ящиков',
      unit: 'пара',
      price: 280.00,
      categoryId: getCategoryId('Фурнитура'),
      baseUnit: 'пара',
      calculationUnit: 'пара',
      conversionFactor: 1.0,
      currentStock: 24.0,
      criticalMinimum: 6.0,
      satisfactoryLevel: 16.0,
      tags: JSON.stringify(['доводчик', 'плавное закрывание'])
    },

    // Крепеж
    {
      name: 'Конфирмат 7x50мм',
      unit: 'шт',
      price: 8.50,
      categoryId: getCategoryId('Крепеж'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 500.0,
      criticalMinimum: 100.0,
      satisfactoryLevel: 300.0,
      tags: JSON.stringify(['конфирмат', 'крепеж', 'основной'])
    },
    {
      name: 'Саморез 4x16мм',
      unit: 'шт',
      price: 2.50,
      categoryId: getCategoryId('Крепеж'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 800.0,
      criticalMinimum: 200.0,
      satisfactoryLevel: 500.0,
      tags: JSON.stringify(['саморез', 'крепеж'])
    },
    {
      name: 'Шкант 8x40мм',
      unit: 'шт',
      price: 5.00,
      categoryId: getCategoryId('Крепеж'),
      baseUnit: 'шт',
      calculationUnit: 'шт',
      conversionFactor: 1.0,
      currentStock: 200.0,
      criticalMinimum: 50.0,
      satisfactoryLevel: 150.0,
      tags: JSON.stringify(['шкант', 'соединение'])
    },
    {
      name: 'Стяжка эксцентриковая',
      unit: 'компл',
      price: 25.00,
      categoryId: getCategoryId('Крепеж'),
      baseUnit: 'компл',
      calculationUnit: 'компл',
      conversionFactor: 1.0,
      currentStock: 80.0,
      criticalMinimum: 20.0,
      satisfactoryLevel: 50.0,
      tags: JSON.stringify(['стяжка', 'эксцентрик', 'быстрая сборка'])
    },

    // Отделочные материалы
    {
      name: 'Клей ПВА D3',
      unit: 'кг',
      price: 185.00,
      categoryId: getCategoryId('Отделочные материалы'),
      baseUnit: 'кг',
      calculationUnit: 'г',
      conversionFactor: 1000.0,
      usagePerUnit: 50.0, // 50г на 1м² склейки
      currentStock: 8.5,
      criticalMinimum: 2.0,
      satisfactoryLevel: 5.0,
      tags: JSON.stringify(['клей', 'ПВА', 'склейка'])
    },
    {
      name: 'Лак акриловый матовый',
      unit: 'л',
      price: 650.00,
      categoryId: getCategoryId('Отделочные материалы'),
      baseUnit: 'л',
      calculationUnit: 'мл',
      conversionFactor: 1000.0,
      coverageArea: 12.0, // 1л на 12м²
      currentStock: 4.5,
      criticalMinimum: 1.0,
      satisfactoryLevel: 3.0,
      tags: JSON.stringify(['лак', 'защита', 'финиш'])
    }
  ];

  console.log('📦 Добавление материалов...');
  
  for (const materialData of materials) {
    try {
      const material = await prisma.materialItem.create({
        data: materialData
      });
      console.log(`✅ Добавлен: ${material.name} - ${material.price} ${material.currency}/${material.unit}`);
    } catch (error) {
      console.log(`❌ Ошибка при добавлении ${materialData.name}:`, error.message);
    }
  }

  // Статистика
  const totalMaterials = await prisma.materialItem.count();
  const cupboardMaterials = await prisma.materialItem.count({
    where: {
      OR: [
        { tags: { contains: 'шкаф' } },
        { tags: { contains: 'купе' } },
        { tags: { contains: 'мебель' } }
      ]
    }
  });

  console.log('\n📊 Статистика:');
  console.log(`Всего материалов в базе: ${totalMaterials}`);
  console.log(`Материалов для шкафов-купе: ${cupboardMaterials}`);
  
  // Группировка по категориям
  const categoryStats = await prisma.materialItem.groupBy({
    by: ['categoryId'],
    _count: true,
    where: {
      OR: [
        { tags: { contains: 'шкаф' } },
        { tags: { contains: 'купе' } },
        { tags: { contains: 'мебель' } }
      ]
    }
  });

  console.log('\n📋 По категориям:');
  for (const stat of categoryStats) {
    const category = categoriesFromDB.find(c => c.id === stat.categoryId);
    console.log(`${category?.name || 'Без категории'}: ${stat._count} материалов`);
  }

  console.log('\n🎉 Материалы для шкафа-купе успешно добавлены!');
}

addCupboardMaterials()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
