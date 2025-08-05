const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAdvertisingMaterials() {
  try {
    console.log('🎨 Добавляем материалы для рекламного производства...');

    // 1. Создаем категории для рекламных материалов
    const categories = [
      {
        name: 'Баннерные материалы',
        description: 'Материалы для изготовления баннеров и вывесок'
      },
      {
        name: 'Печатные материалы',
        description: 'Материалы для офсетной и цифровой печати'
      },
      {
        name: 'Пленки и покрытия',
        description: 'Самоклеящиеся пленки и защитные покрытия'
      },
      {
        name: 'Крепеж и фурнитура',
        description: 'Крепежные элементы для монтажа рекламы'
      },
      {
        name: 'Световые материалы',
        description: 'Материалы для световых коробов и подсветки'
      }
    ];

    const createdCategories = {};
    for (const category of categories) {
      try {
        const existingCategory = await prisma.category.findFirst({
          where: { name: category.name, isActive: true }
        });

        if (!existingCategory) {
          const newCategory = await prisma.category.create({
            data: category
          });
          createdCategories[category.name] = newCategory.id;
          console.log(`✅ Создана категория: ${category.name}`);
        } else {
          createdCategories[category.name] = existingCategory.id;
          console.log(`ℹ️  Категория уже существует: ${category.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Ошибка при создании категории ${category.name}:`, error.message);
      }
    }

    // 2. Добавляем материалы для баннеров
    const materials = [
      // Баннерные материалы
      {
        name: 'Баннерная ткань 440 г/м²',
        unit: 'м²',
        price: 320.00,
        currency: 'RUB',
        categoryId: createdCategories['Баннерные материалы'],
        description: 'Плотная баннерная ткань для уличной рекламы'
      },
      {
        name: 'Баннерная ткань 510 г/м²',
        unit: 'м²',
        price: 380.00,
        currency: 'RUB',
        categoryId: createdCategories['Баннерные материалы'],
        description: 'Усиленная баннерная ткань для больших форматов'
      },
      {
        name: 'Сетка баннерная 230 г/м²',
        unit: 'м²',
        price: 280.00,
        currency: 'RUB',
        categoryId: createdCategories['Баннерные материалы'],
        description: 'Перфорированная сетка для ветровых нагрузок'
      },
      {
        name: 'Mesh-баннер 270 г/м²',
        unit: 'м²',
        price: 290.00,
        currency: 'RUB',
        categoryId: createdCategories['Баннерные материалы'],
        description: 'Сетчатый материал для наружной рекламы'
      },

      // Печатные материалы
      {
        name: 'Самоклеящаяся пленка белая',
        unit: 'м²',
        price: 450.00,
        currency: 'RUB',
        categoryId: createdCategories['Печатные материалы'],
        description: 'Белая виниловая пленка для интерьерной печати'
      },
      {
        name: 'Фотобумага глянцевая 200 г/м²',
        unit: 'м²',
        price: 380.00,
        currency: 'RUB',
        categoryId: createdCategories['Печатные материалы'],
        description: 'Глянцевая фотобумага для высококачественной печати'
      },
      {
        name: 'Холст для печати 350 г/м²',
        unit: 'м²',
        price: 520.00,
        currency: 'RUB',
        categoryId: createdCategories['Печатные материалы'],
        description: 'Текстурированный холст для художественной печати'
      },
      {
        name: 'Бумага для плакатов 150 г/м²',
        unit: 'м²',
        price: 180.00,
        currency: 'RUB',
        categoryId: createdCategories['Печатные материалы'],
        description: 'Матовая бумага для постеров и плакатов'
      },

      // Пленки и покрытия
      {
        name: 'Оракал 641 (цветная пленка)',
        unit: 'м²',
        price: 680.00,
        currency: 'RUB',
        categoryId: createdCategories['Пленки и покрытия'],
        description: 'Цветная виниловая пленка для резки'
      },
      {
        name: 'Пленка прозрачная защитная',
        unit: 'м²',
        price: 420.00,
        currency: 'RUB',
        categoryId: createdCategories['Пленки и покрытия'],
        description: 'Защитная ламинирующая пленка'
      },
      {
        name: 'Антигравийная пленка',
        unit: 'м²',
        price: 1200.00,
        currency: 'RUB',
        categoryId: createdCategories['Пленки и покрытия'],
        description: 'Защитная пленка от механических повреждений'
      },
      {
        name: 'Пленка One Way Vision',
        unit: 'м²',
        price: 890.00,
        currency: 'RUB',
        categoryId: createdCategories['Пленки и покрытия'],
        description: 'Перфорированная пленка одностороннего видения'
      },

      // Крепеж и фурнитура
      {
        name: 'Люверсы металлические 12мм',
        unit: 'шт',
        price: 8.50,
        currency: 'RUB',
        categoryId: createdCategories['Крепеж и фурнитура'],
        description: 'Металлические люверсы для баннеров'
      },
      {
        name: 'Карабины для баннеров',
        unit: 'шт',
        price: 25.00,
        currency: 'RUB',
        categoryId: createdCategories['Крепеж и фурнитура'],
        description: 'Карабины для крепления баннеров'
      },
      {
        name: 'Стяжки нейлоновые 200мм',
        unit: 'уп',
        price: 180.00,
        currency: 'RUB',
        categoryId: createdCategories['Крепеж и фурнитура'],
        description: 'Упаковка 100 шт нейлоновых стяжек'
      },
      {
        name: 'Профиль алюминиевый 20x20',
        unit: 'м',
        price: 120.00,
        currency: 'RUB',
        categoryId: createdCategories['Крепеж и фурнитура'],
        description: 'Алюминиевый профиль для каркасов'
      },
      {
        name: 'Саморезы с пресс-шайбой',
        unit: 'уп',
        price: 95.00,
        currency: 'RUB',
        categoryId: createdCategories['Крепеж и фурнитура'],
        description: 'Упаковка 100 шт саморезов'
      },

      // Световые материалы
      {
        name: 'Акрил молочный 3мм',
        unit: 'м²',
        price: 890.00,
        currency: 'RUB',
        categoryId: createdCategories['Световые материалы'],
        description: 'Молочный акрил для световых коробов'
      },
      {
        name: 'Акрил прозрачный 5мм',
        unit: 'м²',
        price: 1150.00,
        currency: 'RUB',
        categoryId: createdCategories['Световые материалы'],
        description: 'Прозрачный акрил высокого качества'
      },
      {
        name: 'LED лента 12V белая',
        unit: 'м',
        price: 280.00,
        currency: 'RUB',
        categoryId: createdCategories['Световые материалы'],
        description: 'Светодиодная лента для подсветки'
      },
      {
        name: 'Блок питания 12V 100W',
        unit: 'шт',
        price: 1200.00,
        currency: 'RUB',
        categoryId: createdCategories['Световые материалы'],
        description: 'Блок питания для LED подсветки'
      },
      {
        name: 'Неон гибкий 12V',
        unit: 'м',
        price: 420.00,
        currency: 'RUB',
        categoryId: createdCategories['Световые материалы'],
        description: 'Гибкий неон для контурной подсветки'
      }
    ];

    // Добавляем материалы
    let addedCount = 0;
    for (const material of materials) {
      try {
        const existingMaterial = await prisma.materialItem.findFirst({
          where: { 
            name: material.name,
            isActive: true 
          }
        });

        if (!existingMaterial) {
      await prisma.materialItem.create({
        data: {
          name: material.name,
          unit: material.unit,
          price: material.price,
          currency: material.currency,
          category: {
            connect: { id: material.categoryId }
          },
          currentStock: material.currentStock || 0,
          baseUnit: material.unit,
        }
      });
          addedCount++;
          console.log(`✅ Добавлен материал: ${material.name}`);
        } else {
          console.log(`ℹ️  Материал уже существует: ${material.name}`);
        }
      } catch (error) {
        console.log(`⚠️  Ошибка при добавлении материала ${material.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Успешно добавлено ${addedCount} новых материалов для рекламного производства!`);
    console.log(`📁 Создано ${Object.keys(createdCategories).length} категорий`);
    
    // Показываем статистику по категориям
    for (const [categoryName, categoryId] of Object.entries(createdCategories)) {
      const count = await prisma.materialItem.count({
        where: { 
          categoryId: categoryId,
          isActive: true 
        }
      });
      console.log(`   📂 ${categoryName}: ${count} материалов`);
    }

  } catch (error) {
    console.error('❌ Ошибка при добавлении материалов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdvertisingMaterials();
