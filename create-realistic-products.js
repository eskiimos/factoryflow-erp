const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRealisticProducts() {
  try {
    // Получаем существующие ресурсы
    const materials = await prisma.materialItem.findMany({
      where: { isActive: true }
    });
    
    const workTypes = await prisma.workType.findMany({
      where: { isActive: true }
    });
    
    const groups = await prisma.productGroup.findMany({
      where: { isActive: true },
      include: { subgroups: true }
    });

    console.log('Найдено материалов:', materials.length);
    console.log('Найдено видов работ:', workTypes.length);
    console.log('Найдено групп продуктов:', groups.length);

    // Определяем продукты с их составом
    const productDefinitions = [
      {
        name: 'Баннер виниловый 3×2м',
        description: 'Виниловый баннер размером 3×2 метра с полноцветной печатью',
        unit: 'шт',
        baseUnit: 'м²',
        area: 6, // 3×2 = 6 м²
        groupName: 'Наружная реклама',
        materials: [
          { name: 'Баннерная ткань 510г/м²', quantityPerUnit: 6.5 }, // +запас 8%
          { name: 'Люверсы медные 8мм', quantityPerUnit: 16 }, // по периметру через 50см
        ],
        workTypes: [
          { name: 'Дизайн баннера простой', timePerUnit: 2 }, // 2 часа дизайна
          { name: 'Широкоформатная печать', timePerUnit: 0.5 }, // 30 мин печати
          { name: 'Установка люверсов', timePerUnit: 1 }, // 1 час установки люверсов
        ]
      },
      {
        name: 'Световая вывеска LED 2×0.5м',
        description: 'Световая вывеска с LED подсветкой, размер 2×0.5 метра',
        unit: 'шт',
        baseUnit: 'м²',
        area: 1, // 2×0.5 = 1 м²
        groupName: 'Наружная реклама',
        materials: [
          { name: 'Композит 4мм белый', quantityPerUnit: 1.1 }, // +запас
          { name: 'Акрил 3мм прозрачный', quantityPerUnit: 1.1 },
          { name: 'Алюминиевый профиль 30x30мм', quantityPerUnit: 6 }, // периметр + перемычки
          { name: 'Соединитель угловой 30мм', quantityPerUnit: 8 },
          { name: 'Саморез 4x16мм', quantityPerUnit: 20 },
        ],
        workTypes: [
          { name: 'Разработка логотипа', timePerUnit: 3 }, // 3 часа дизайна
          { name: 'Фрезеровка ЧПУ', timePerUnit: 2 }, // 2 часа фрезеровки
          { name: 'УФ-печать', timePerUnit: 0.3 }, // 20 мин печати
          { name: 'Сварка металлоконструкций', timePerUnit: 1.5 }, // сборка каркаса
          { name: 'Электромонтажные работы', timePerUnit: 2 }, // подключение LED
          { name: 'Монтаж наружной рекламы', timePerUnit: 3 }, // установка
        ]
      },
      {
        name: 'Информационный стенд А1',
        description: 'Информационный стенд формата А1 на композите',
        unit: 'шт',
        baseUnit: 'м²',
        area: 0.594, // А1 = 594×841мм = 0.594 м²
        groupName: 'Интерьерная реклама',
        materials: [
          { name: 'Композит 3мм белый', quantityPerUnit: 0.65 }, // +запас
          { name: 'Алюминиевый профиль 20x20мм', quantityPerUnit: 3 }, // крепление
          { name: 'Соединитель угловой 20мм', quantityPerUnit: 4 },
          { name: 'Дюбель 6x40мм', quantityPerUnit: 4 },
        ],
        workTypes: [
          { name: 'Дизайн баннера простой', timePerUnit: 1.5 },
          { name: 'УФ-печать', timePerUnit: 0.2 },
          { name: 'Фрезеровка ЧПУ', timePerUnit: 0.5 },
          { name: 'Монтаж интерьерной рекламы', timePerUnit: 1 },
        ]
      },
      {
        name: 'Табличка офисная 200×50мм',
        description: 'Офисная табличка на дверь из акрила с гравировкой',
        unit: 'шт',
        baseUnit: 'м²',
        area: 0.01, // 200×50мм = 0.01 м²
        groupName: 'Интерьерная реклама',
        materials: [
          { name: 'Акрил 3мм прозрачный', quantityPerUnit: 0.015 }, // +запас
          { name: 'Двусторонний скотч 3М', quantityPerUnit: 0.1 },
        ],
        workTypes: [
          { name: 'Дизайн визитки', timePerUnit: 0.5 }, // простой дизайн
          { name: 'Лазерная резка', timePerUnit: 0.1 }, // резка + гравировка
        ]
      },
      {
        name: 'Визитки премиум (500 шт)',
        description: 'Визитные карточки на дизайнерской бумаге с ламинированием',
        unit: 'комплект',
        baseUnit: 'шт',
        area: 500, // 500 штук
        groupName: 'Полиграфическая продукция',
        materials: [
          { name: 'Самоклеящаяся бумага белая', quantityPerUnit: 0.3 }, // ~0.3 м² на 500 визиток
          { name: 'Ламинирующая пленка глянец', quantityPerUnit: 0.35 }, // +запас
        ],
        workTypes: [
          { name: 'Дизайн визитки', timePerUnit: 2 }, // дизайн визитки
          { name: 'Резка гильотиной', timePerUnit: 0.5 }, // резка
          { name: 'Ламинирование', timePerUnit: 0.3 }, // ламинирование
        ]
      }
    ];

    // Очищаем старые тестовые продукты
    await prisma.product.deleteMany({
      where: {
        OR: [
          { name: { startsWith: 'Тест' } },
          { sku: { startsWith: 'TEST-' } },
          { sku: { startsWith: 'PRD-' } }
        ]
      }
    });

    console.log('Старые тестовые продукты удалены');

    // Создаем новые продукты
    for (const productDef of productDefinitions) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      
      // Находим группу
      const group = groups.find(g => g.name === productDef.groupName);
      if (!group) {
        console.log(`Группа ${productDef.groupName} не найдена`);
        continue;
      }

      // Берем первую подгруппу
      const subgroup = group.subgroups[0];

      // Рассчитываем стоимость материалов
      let materialCost = 0;
      const productMaterials = [];
      
      for (const matDef of productDef.materials) {
        const material = materials.find(m => m.name === matDef.name);
        if (material) {
          const cost = material.price * matDef.quantityPerUnit;
          materialCost += cost;
          
          productMaterials.push({
            materialItemId: material.id,
            quantity: matDef.quantityPerUnit,
            cost: cost,
            unitType: 'fixed'
          });
        }
      }

      // Рассчитываем стоимость работ
      let laborCost = 0;
      let totalTime = 0;
      const productWorkTypes = [];
      
      for (const workDef of productDef.workTypes) {
        const workType = workTypes.find(w => w.name === workDef.name);
        if (workType) {
          const cost = workType.hourlyRate * workDef.timePerUnit;
          laborCost += cost;
          totalTime += workDef.timePerUnit;
          
          productWorkTypes.push({
            workTypeId: workType.id,
            quantity: workDef.timePerUnit,
            cost: cost,
            unitType: 'fixed'
          });
        }
      }

      const totalCost = materialCost + laborCost;
      const sellingPrice = totalCost * 1.4; // наценка 40%
      const margin = ((sellingPrice - totalCost) / sellingPrice) * 100;

      // Создаем продукт
      const product = await prisma.product.create({
        data: {
          name: productDef.name,
          description: productDef.description,
          sku: `SKU-${timestamp}-${random}`,
          unit: productDef.unit,
          baseUnit: productDef.baseUnit,
          type: 'PRODUCT',
          pricingMethod: 'CALCULATED',
          basePrice: totalCost,
          sellingPrice: Math.round(sellingPrice),
          materialCost: Math.round(materialCost),
          laborCost: Math.round(laborCost),
          totalCost: Math.round(totalCost),
          margin: Math.round(margin * 100) / 100,
          productionTime: totalTime,
          groupId: group.id,
          subgroupId: subgroup?.id,
          isActive: true,
          currentStock: Math.floor(Math.random() * 20) + 5,
          minStock: 2,
          maxStock: 50,
          // Создаем связи с материалами
          materialUsages: {
            create: productMaterials
          },
          // Создаем связи с видами работ
          workTypeUsages: {
            create: productWorkTypes
          }
        }
      });

      console.log(`✅ Создан продукт: ${product.name}`);
      console.log(`   Материалы: ${Math.round(materialCost)} руб`);
      console.log(`   Работы: ${Math.round(laborCost)} руб (${totalTime} ч)`);
      console.log(`   Себестоимость: ${Math.round(totalCost)} руб`);
      console.log(`   Цена продажи: ${Math.round(sellingPrice)} руб`);
      console.log(`   Маржа: ${Math.round(margin)}%\n`);
    }

    console.log('Все продукты созданы успешно!');
    
  } catch (error) {
    console.error('Ошибка при создании продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealisticProducts();
