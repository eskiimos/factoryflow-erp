const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingProductsFixed() {
  console.log('🏭 Создание товаров для рекламного производства...');

  // Получаем все существующие данные
  const productGroups = await prisma.productGroup.findMany({ where: { isActive: true } });
  const productSubgroups = await prisma.productSubgroup.findMany({ where: { isActive: true } });
  const materials = await prisma.materialItem.findMany({ where: { isActive: true } });
  const workTypes = await prisma.workType.findMany({ where: { isActive: true } });
  const funds = await prisma.fund.findMany({ where: { isActive: true } });
  const categories = await prisma.category.findMany({ where: { isActive: true } });

  console.log(`📦 Найдено: ${materials.length} материалов, ${workTypes.length} видов работ, ${funds.length} фондов`);

  // Функции для поиска
  const findSubgroup = (name) => productSubgroups.find(sg => sg.name.toLowerCase().includes(name.toLowerCase()));
  const findMaterial = (name) => materials.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
  const findWorkType = (name) => workTypes.find(w => w.name.toLowerCase().includes(name.toLowerCase()));
  const findFund = (type) => funds.find(f => f.fundType === type);
  const findCategory = (name) => categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));

  // Функция для генерации SKU
  const generateSKU = (productName, index) => {
    const words = productName.split(' ');
    const initials = words.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join('');
    return `${initials}${String(index + 1).padStart(3, '0')}`;
  };

  // Создаем товары с правильными расчетами за минимальные единицы
  const productsData = [
    // НАРУЖНАЯ РЕКЛАМА - Вывески
    {
      name: 'Вывеска на композите 4мм',
      description: 'Объемная вывеска из композитного материала с нанесением пленки',
      unit: 'см²',
      subgroupName: 'Вывески',
      categoryName: 'Наружная реклама',
      materials: [
        { name: 'композит', quantity: 1 }, // 1 см²
        { name: 'пленка', quantity: 1.1 }, // 1.1 см² (с запасом)
        { name: 'болт', quantity: 0.01 } // болты на см²
      ],
      workTypes: [
        { name: 'резка', time: 0.02 }, // 0.02 часа на см²
        { name: 'оклейка', time: 0.03 }
      ],
      currentStock: 0,
      minStock: 50000, // минимум 5 м²
      maxStock: 500000 // максимум 50 м²
    },

    {
      name: 'Баннер на люверсах',
      description: 'Баннер из ПВХ ткани с цифровой печатью и установкой люверсов',
      unit: 'см²',
      subgroupName: 'Баннеры и растяжки',
      categoryName: 'Наружная реклама',
      materials: [
        { name: 'баннер', quantity: 1 },
        { name: 'люверс', quantity: 0.005 }, // 5 люверсов на 1000 см²
        { name: 'краска', quantity: 0.001 } // расход краски
      ],
      workTypes: [
        { name: 'печать', time: 0.001 },
        { name: 'люверсы', time: 0.002 }
      ],
      currentStock: 0,
      minStock: 100000,
      maxStock: 1000000
    },

    {
      name: 'Световой короб односторонний',
      description: 'Световой короб с LED подсветкой и пластиковой лицевой панелью',
      unit: 'см²',
      subgroupName: 'Световые короба',
      categoryName: 'Наружная реклама',
      materials: [
        { name: 'профиль', quantity: 0.4 }, // периметр на см²
        { name: 'пластик', quantity: 1 },
        { name: 'лента', quantity: 0.1 },
        { name: 'пленка', quantity: 1.1 }
      ],
      workTypes: [
        { name: 'сборка', time: 0.05 },
        { name: 'оклейка', time: 0.03 },
        { name: 'электрика', time: 0.02 }
      ],
      currentStock: 0,
      minStock: 10000,
      maxStock: 100000
    },

    // ИНТЕРЬЕРНАЯ РЕКЛАМА - Таблички
    {
      name: 'Табличка из ПВХ 3мм',
      description: 'Информационная табличка из белого ПВХ с нанесением пленки',
      unit: 'см²',
      subgroupName: 'Таблички и вывески',
      categoryName: 'Интерьерная реклама',
      materials: [
        { name: 'пвх', quantity: 1 },
        { name: 'пленка', quantity: 1.05 }
      ],
      workTypes: [
        { name: 'резка', time: 0.01 },
        { name: 'оклейка', time: 0.02 }
      ],
      currentStock: 0,
      minStock: 5000,
      maxStock: 50000
    },

    {
      name: 'Бейдж на магните',
      description: 'Именной бейдж из пластика с магнитным креплением',
      unit: 'шт',
      subgroupName: 'Бейджи',
      categoryName: 'Интерьерная реклама',
      materials: [
        { name: 'пластик', quantity: 12 }, // 12 см² на бейдж
        { name: 'магнит', quantity: 1 },
        { name: 'пленка', quantity: 13 }
      ],
      workTypes: [
        { name: 'резка', time: 0.05 },
        { name: 'оклейка', time: 0.1 }
      ],
      currentStock: 0,
      minStock: 100,
      maxStock: 1000
    },

    // ПОЛИГРАФИЧЕСКАЯ ПРОДУКЦИЯ
    {
      name: 'Визитка на дизайнерской бумаге',
      description: 'Визитная карточка 90x50мм на дизайнерской бумаге 300г/м²',
      unit: 'шт',
      subgroupName: 'Визитки и пластиковые карты',
      categoryName: 'Полиграфическая продукция',
      materials: [
        { name: 'бумага', quantity: 4.5 }, // 4.5 см²
        { name: 'краска', quantity: 0.5 }
      ],
      workTypes: [
        { name: 'печать', time: 0.002 },
        { name: 'резка', time: 0.001 }
      ],
      currentStock: 0,
      minStock: 1000,
      maxStock: 10000
    },

    {
      name: 'Листовка А4 4+0',
      description: 'Листовка формата А4 с полноцветной печатью с одной стороны',
      unit: 'шт',
      subgroupName: 'Листовки и флаеры',
      categoryName: 'Полиграфическая продукция',
      materials: [
        { name: 'бумага', quantity: 623.7 }, // площадь А4 в см²
        { name: 'краска', quantity: 5 }
      ],
      workTypes: [
        { name: 'печать', time: 0.01 },
        { name: 'резка', time: 0.002 }
      ],
      currentStock: 0,
      minStock: 500,
      maxStock: 5000
    },

    {
      name: 'Каталог на скобе 16 полос',
      description: 'Каталог формата А4, 16 полос, печать 4+4, крепление скобой',
      unit: 'шт',
      subgroupName: 'Каталоги и брошюры',
      categoryName: 'Полиграфическая продукция',
      materials: [
        { name: 'бумага', quantity: 4989.6 }, // 8 листов А4
        { name: 'краска', quantity: 40 },
        { name: 'скоба', quantity: 2 }
      ],
      workTypes: [
        { name: 'печать', time: 0.1 },
        { name: 'сборка', time: 0.05 },
        { name: 'резка', time: 0.02 }
      ],
      currentStock: 0,
      minStock: 100,
      maxStock: 1000
    },

    // СУВЕНИРНАЯ ПРОДУКЦИЯ
    {
      name: 'Ручка с логотипом',
      description: 'Пластиковая ручка с нанесением логотипа тампопечатью',
      unit: 'шт',
      subgroupName: 'Ручки и канцелярия',
      categoryName: 'Сувенирная продукция',
      materials: [
        { name: 'ручка', quantity: 1 },
        { name: 'краска', quantity: 0.1 }
      ],
      workTypes: [
        { name: 'тампопечать', time: 0.02 }
      ],
      currentStock: 0,
      minStock: 100,
      maxStock: 5000
    },

    {
      name: 'Кружка с сублимацией',
      description: 'Белая керамическая кружка 330мл с сублимационной печатью',
      unit: 'шт',
      subgroupName: 'Посуда и кружки',
      categoryName: 'Сувенирная продукция',
      materials: [
        { name: 'кружка', quantity: 1 },
        { name: 'бумага', quantity: 80 }, // площадь печати
        { name: 'краска', quantity: 2 }
      ],
      workTypes: [
        { name: 'печать', time: 0.05 },
        { name: 'сублимация', time: 0.1 }
      ],
      currentStock: 0,
      minStock: 50,
      maxStock: 500
    }
  ];

  // Создаем товары
  const createdProducts = [];
  
  for (let i = 0; i < productsData.length; i++) {
    const productData = productsData[i];
    
    try {
      console.log(`\n📦 Создание товара: ${productData.name}`);
      
      // Находим подгруппу
      const subgroup = findSubgroup(productData.subgroupName);
      
      if (!subgroup) {
        console.log(`❌ Подгруппа не найдена для: ${productData.subgroupName}`);
        continue;
      }

      // Рассчитываем стоимость материалов
      let materialsCost = 0;
      const validMaterials = [];
      
      for (const matUsage of productData.materials) {
        const material = findMaterial(matUsage.name);
        if (material) {
          materialsCost += material.price * matUsage.quantity;
          validMaterials.push({ material, quantity: matUsage.quantity });
        } else {
          console.log(`⚠️ Материал не найден: ${matUsage.name}`);
        }
      }

      // Рассчитываем стоимость работ
      let laborCost = 0;
      let totalTime = 0;
      const validWorkTypes = [];
      
      for (const workUsage of productData.workTypes) {
        const workType = findWorkType(workUsage.name);
        if (workType) {
          const cost = workType.hourlyRate * workUsage.time;
          laborCost += cost;
          totalTime += workUsage.time;
          validWorkTypes.push({ workType, time: workUsage.time });
        } else {
          console.log(`⚠️ Вид работ не найден: ${workUsage.name}`);
        }
      }

      // Рассчитываем накладные расходы (10% от прямых затрат)
      const overheadCost = (materialsCost + laborCost) * 0.1;
      const totalCost = materialsCost + laborCost + overheadCost;
      
      // Цена с наценкой 25%
      const sellingPrice = totalCost * 1.25;

      console.log(`💰 Материалы: ${materialsCost.toFixed(2)}₽, Работы: ${laborCost.toFixed(2)}₽, Накладные: ${overheadCost.toFixed(2)}₽`);
      console.log(`💰 Итого себестоимость: ${totalCost.toFixed(2)}₽, Цена продажи: ${sellingPrice.toFixed(2)}₽`);

      // Создаем товар
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          sku: generateSKU(productData.name, i),
          unit: productData.unit,
          sellingPrice: Number(sellingPrice.toFixed(2)),
          subgroupId: subgroup.id,
          currentStock: productData.currentStock,
          minStock: productData.minStock,
          maxStock: productData.maxStock,
          isActive: true
        }
      });

      // Создаем связи с материалами
      for (const { material, quantity } of validMaterials) {
        await prisma.productMaterialUsage.create({
          data: {
            productId: product.id,
            materialItemId: material.id,
            quantity: Number(quantity.toFixed(4)),
            cost: Number((material.price * quantity).toFixed(2))
          }
        });
      }

      // Создаем связи с видами работ
      for (const { workType, time } of validWorkTypes) {
        await prisma.productWorkTypeUsage.create({
          data: {
            productId: product.id,
            workTypeId: workType.id,
            quantity: Number(time.toFixed(4)),
            cost: Number((workType.hourlyRate * time).toFixed(2))
          }
        });
      }

      // Добавляем использование фондов (общие накладные расходы)
      const funds = await prisma.fund.findMany({ where: { isActive: true }, take: 1 });
      if (funds.length > 0) {
        await prisma.productFundUsage.create({
          data: {
            productId: product.id,
            fundId: funds[0].id,
            allocationPercentage: 10.0
          }
        });
      }

      createdProducts.push(product);
      console.log(`✅ Товар создан: ${product.name} (${product.sku})`);
      
    } catch (error) {
      console.error(`❌ Ошибка создания товара ${productData.name}:`, error.message);
    }
  }

  console.log(`\n🎉 Создано ${createdProducts.length} товаров`);
  
  await prisma.$disconnect();
  return createdProducts;
}

if (require.main === module) {
  createAdvertisingProductsFixed()
    .catch((e) => {
      console.error('❌ Ошибка создания товаров:', e);
      process.exit(1);
    });
}

module.exports = { createAdvertisingProducts: createAdvertisingProductsFixed };
