const { PrismaClient } = require('@prisma/client');
const { createProductGroups } = require('./create-advertising-product-groups');
const prisma = new PrismaClient();

async function createAdvertisingProducts() {
  console.log('🏭 Создание товаров для рекламного производства...');

  // Сначала создаем группы и подгруппы
  const { groups, subgroups } = await createProductGroups();
  
  // Получаем все существующие материалы
  const materials = await prisma.materialItem.findMany({
    where: { isActive: true }
  });
  
  // Получаем все существующие виды работ
  const workTypes = await prisma.workType.findMany({
    where: { isActive: true }
  });

  // Получаем все существующие фонды
  const funds = await prisma.fund.findMany({
    where: { isActive: true }
  });

  console.log(`📦 Найдено: ${materials.length} материалов, ${workTypes.length} видов работ, ${funds.length} фондов`);

  // Функция для поиска подгруппы по части названия
  const findSubgroup = (name) => subgroups.find(sg => sg.name.toLowerCase().includes(name.toLowerCase()));

  // Функция для поиска материала по части названия
  const findMaterial = (name) => materials.find(m => m.name.toLowerCase().includes(name.toLowerCase()));

  // Функция для поиска вида работ по части названия
  const findWorkType = (name) => workTypes.find(w => w.name.toLowerCase().includes(name.toLowerCase()));

  // Функция для поиска фонда по типу
  const findFund = (type) => funds.find(f => f.fundType === type);

  // Создаем товары
  const products = [
    // Наружная реклама - Вывески
    {
      name: 'Вывеска объемная из ПВХ',
      description: 'Объемные буквы из ПВХ 5мм с лицевой подсветкой',
      baseUnit: 'см²',
      basePrice: 12.50,
      sellingPrice: 18.75,
      markup: 1.5,
      minQuantity: 5000,
      productSubgroupId: findSubgroup('Вывески').id,
      isActive: true,
      materialUsages: {
        create: [
          {
            materialId: findMaterial('ПВХ 5мм').id,
            quantity: 1.2, // с учетом отхода
            isRequired: true
          },
          {
            materialId: findMaterial('LED').id,
            quantity: 0.2,
            isRequired: true
          },
          {
            materialId: findMaterial('Блок питания').id,
            quantity: 0.02,
            isRequired: true
          }
        ]
      },
      workTypeUsages: {
        create: [
          {
            workTypeId: findWorkType('Фрезеровка').id,
            quantity: 1.0,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Сборка').id,
            quantity: 0.5,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Монтаж').id,
            quantity: 0.3,
            isRequired: true
          }
        ]
      },
      fundUsages: {
        create: [
          {
            fundId: findFund('OVERHEAD').id,
            amount: 1.5
          },
          {
            fundId: findFund('COMMERCIAL').id,
            amount: 0.8
          }
        ]
      }
    },
    {
      name: 'Световой короб односторонний',
      description: 'Лайтбокс из композита с внутренней подсветкой',
      baseUnit: 'м²',
      basePrice: 3500.00,
      sellingPrice: 5250.00,
      markup: 1.5,
      minQuantity: 1,
      productSubgroupId: findSubgroup('Световые короба').id,
      isActive: true,
      materialUsages: {
        create: [
          {
            materialId: findMaterial('Композит').id,
            quantity: 1.2,
            isRequired: true
          },
          {
            materialId: findMaterial('LED').id,
            quantity: 4,
            isRequired: true
          },
          {
            materialId: findMaterial('Блок питания').id,
            quantity: 1,
            isRequired: true
          },
          {
            materialId: findMaterial('Акрил').id,
            quantity: 1,
            isRequired: true
          }
        ]
      },
      workTypeUsages: {
        create: [
          {
            workTypeId: findWorkType('Фрезеровка').id,
            quantity: 1.0,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Сварка').id,
            quantity: 1.0,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Электромонтаж').id,
            quantity: 1.0,
            isRequired: true
          }
        ]
      },
      fundUsages: {
        create: [
          {
            fundId: findFund('OVERHEAD').id,
            amount: 2.5
          },
          {
            fundId: findFund('COMMERCIAL').id,
            amount: 1.2
          }
        ]
      }
    },
    {
      name: 'Баннер на люверсах',
      description: 'Баннер 440г/м² с усилением по периметру и люверсами',
      baseUnit: 'м²',
      basePrice: 450.00,
      sellingPrice: 675.00,
      markup: 1.5,
      minQuantity: 2,
      productSubgroupId: findSubgroup('Баннеры').id,
      isActive: true,
      materialUsages: {
        create: [
          {
            materialId: findMaterial('Баннерная ткань 440').id,
            quantity: 1.1,
            isRequired: true
          },
          {
            materialId: findMaterial('Люверсы').id,
            quantity: 4,
            isRequired: true
          }
        ]
      },
      workTypeUsages: {
        create: [
          {
            workTypeId: findWorkType('Широкоформатная печать').id,
            quantity: 1.0,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Установка люверсов').id,
            quantity: 1.0,
            isRequired: true
          }
        ]
      },
      fundUsages: {
        create: [
          {
            fundId: findFund('OVERHEAD').id,
            amount: 0.8
          },
          {
            fundId: findFund('COMMERCIAL').id,
            amount: 0.5
          }
        ]
      }
    },

    // Полиграфия
    {
      name: 'Визитки односторонние',
      description: 'Визитные карточки 90x50мм, бумага 300г/м²',
      baseUnit: 'шт',
      basePrice: 3.50,
      sellingPrice: 5.25,
      markup: 1.5,
      minQuantity: 100,
      productSubgroupId: findSubgroup('Визитки').id,
      isActive: true,
      materialUsages: {
        create: [
          {
            materialId: findMaterial('Бумага').id,
            quantity: 0.1,
            isRequired: true
          }
        ]
      },
      workTypeUsages: {
        create: [
          {
            workTypeId: findWorkType('Дизайн визитки').id,
            quantity: 0.01,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Цифровая печать').id,
            quantity: 1.0,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Резка').id,
            quantity: 1.0,
            isRequired: true
          }
        ]
      },
      fundUsages: {
        create: [
          {
            fundId: findFund('OVERHEAD').id,
            amount: 0.3
          },
          {
            fundId: findFund('COMMERCIAL').id,
            amount: 0.2
          }
        ]
      }
    },
    {
      name: 'Плакат А1',
      description: 'Плакат формата А1, бумага 150г/м²',
      baseUnit: 'шт',
      basePrice: 180.00,
      sellingPrice: 270.00,
      markup: 1.5,
      minQuantity: 10,
      productSubgroupId: findSubgroup('Плакаты').id,
      isActive: true,
      materialUsages: {
        create: [
          {
            materialId: findMaterial('Бумага для плоттера').id,
            quantity: 1,
            isRequired: true
          }
        ]
      },
      workTypeUsages: {
        create: [
          {
            workTypeId: findWorkType('Дизайн баннера простой').id,
            quantity: 0.1,
            isRequired: true
          },
          {
            workTypeId: findWorkType('Широкоформатная печать').id,
            quantity: 1.0,
            isRequired: true
          }
        ]
      },
      fundUsages: {
        create: [
          {
            fundId: findFund('OVERHEAD').id,
            amount: 0.5
          },
          {
            fundId: findFund('COMMERCIAL').id,
            amount: 0.3
          }
        ]
      }
    }
  ];

  // Создаем все товары
  const createdProducts = await Promise.all(
    products.map(product => 
      prisma.product.create({
        data: product,
        include: {
          materialUsages: true,
          workTypeUsages: true,
          fundUsages: true
        }
      })
    )
  );

  console.log(`✅ Создано ${createdProducts.length} товаров для рекламного производства`);
  console.log('📊 Статистика по созданным товарам:');
  createdProducts.forEach(product => {
    console.log(`\n🏷️ ${product.name}:`);
    console.log(`   - Материалов: ${product.materialUsages.length}`);
    console.log(`   - Видов работ: ${product.workTypeUsages.length}`);
    console.log(`   - Фондов: ${product.fundUsages.length}`);
    console.log(`   - Базовая цена: ${product.basePrice} руб/${product.baseUnit}`);
    console.log(`   - Цена продажи: ${product.sellingPrice} руб/${product.baseUnit}`);
  });

  await prisma.$disconnect();
}

createAdvertisingProducts()
  .catch((e) => {
    console.error('❌ Ошибка создания товаров:', e);
    process.exit(1);
  });
