const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWardrobe() {
  console.log('Создаем продукт "Шкаф-купе" с расчетом материалов...');

  try {
    // Получаем материалы
    const ldsp = await prisma.materialItem.findFirst({
      where: { name: { contains: 'ЛДСП' } }
    });
    
    const kromka = await prisma.materialItem.findFirst({
      where: { name: { contains: 'Кромка ПВХ' } }
    });
    
    const napravlyayushchie = await prisma.materialItem.findFirst({
      where: { name: { contains: 'Направляющие' } }
    });
    
    const petli = await prisma.materialItem.findFirst({
      where: { name: { contains: 'Петли' } }
    });

    // Получаем виды работ
    const cutting = await prisma.workType.findFirst({
      where: { name: { contains: 'Раскрой' } }
    });
    
    const assembly = await prisma.workType.findFirst({
      where: { name: { contains: 'Сборка' } }
    });

    // Создаем продукт
    const product = await prisma.product.create({
      data: {
        name: 'Шкаф-купе 3-х дверный',
        description: 'Шкаф-купе с тремя дверями, встроенными ящиками и полками',
        sku: 'SHKAF-KUPE-001',
        unit: 'шт',
        type: 'MANUFACTURED',
        pricingMethod: 'COST_PLUS',
        baseUnit: 'шт',
        basePrice: 0,
        minimumOrder: 1,
        
        // Включаем формулы для расчета
        formulaEnabled: true,
        formulaExpression: '(height * width * depth / 1000000) * materialCostPerM3 + fixedCost',
        
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        sellingPrice: 0,
        margin: 30,
        currency: 'RUB',
        productionTime: 8, // 8 часов на изготовление
        
        currentStock: 0,
        minStock: 1,
        maxStock: 10,
        
        tags: '["мебель", "шкаф", "купе", "корпусная мебель"]',
        specifications: JSON.stringify({
          material: 'ЛДСП 18мм',
          doors: 3,
          shelves: 'регулируемые',
          hardware: 'Blum',
          finish: 'ламинированная'
        })
      }
    });

    console.log(`✓ Создан продукт: ${product.name} (ID: ${product.id})`);

    // Добавляем параметры для расчета
    const parameters = [
      {
        name: 'height',
        type: 'NUMBER',
        unit: 'мм',
        defaultValue: '2200',
        minValue: 1800,
        maxValue: 2700,
        isRequired: true,
        sortOrder: 1,
        description: 'Высота шкафа в миллиметрах'
      },
      {
        name: 'width',
        type: 'NUMBER',
        unit: 'мм',
        defaultValue: '1800',
        minValue: 1200,
        maxValue: 3000,
        isRequired: true,
        sortOrder: 2,
        description: 'Ширина шкафа в миллиметрах'
      },
      {
        name: 'depth',
        type: 'NUMBER',
        unit: 'мм',
        defaultValue: '600',
        minValue: 450,
        maxValue: 800,
        isRequired: true,
        sortOrder: 3,
        description: 'Глубина шкафа в миллиметрах'
      },
      {
        name: 'doorsCount',
        type: 'SELECT',
        selectOptions: JSON.stringify(['2', '3', '4']),
        defaultValue: '3',
        isRequired: true,
        sortOrder: 4,
        description: 'Количество дверей'
      },
      {
        name: 'shelvesCount',
        type: 'NUMBER',
        defaultValue: '4',
        minValue: 2,
        maxValue: 8,
        isRequired: true,
        sortOrder: 5,
        description: 'Количество полок'
      }
    ];

    for (const param of parameters) {
      await prisma.productParameter.create({
        data: {
          ...param,
          productId: product.id
        }
      });
    }

    console.log(`✓ Добавлено параметров: ${parameters.length}`);

    // Добавляем материалы с правильным расчетом
    if (ldsp) {
      await prisma.productMaterialUsage.create({
        data: {
          productId: product.id,
          materialItemId: ldsp.id,
          quantity: 3.5, // 3.5 листа на стандартный шкаф
          cost: 0,
          unitType: 'base',
          baseQuantity: 3.5,
          calculationFormula: '(height * width * depth / 2750000) * 3.5' // Расчет листов ЛДСП
        }
      });
      console.log(`✓ Добавлен материал: ${ldsp.name}`);
    }

    if (kromka) {
      await prisma.productMaterialUsage.create({
        data: {
          productId: product.id,
          materialItemId: kromka.id,
          quantity: 25, // 25 метров кромки
          cost: 0,
          unitType: 'calculated',
          baseQuantity: 25,
          calculationFormula: '((height * 4) + (width * 6) + (depth * 8)) / 1000' // Периметр всех деталей
        }
      });
      console.log(`✓ Добавлен материал: ${kromka.name}`);
    }

    if (napravlyayushchie) {
      await prisma.productMaterialUsage.create({
        data: {
          productId: product.id,
          materialItemId: napravlyayushchie.id,
          quantity: 6, // 6 пар направляющих
          cost: 0,
          unitType: 'fixed',
          baseQuantity: 6,
          calculationFormula: 'shelvesCount * 1.5' // По полторы пары на полку
        }
      });
      console.log(`✓ Добавлен материал: ${napravlyayushchie.name}`);
    }

    if (petli) {
      await prisma.productMaterialUsage.create({
        data: {
          productId: product.id,
          materialItemId: petli.id,
          quantity: 12, // 12 петель
          cost: 0,
          unitType: 'calculated',
          baseQuantity: 12,
          calculationFormula: 'doorsCount * 4' // По 4 петли на дверь
        }
      });
      console.log(`✓ Добавлен материал: ${petli.name}`);
    }

    // Добавляем виды работ
    if (cutting) {
      await prisma.productWorkTypeUsage.create({
        data: {
          productId: product.id,
          workTypeId: cutting.id,
          quantity: 2, // 2 часа на раскрой
          cost: 0,
          sequence: 1,
          unitType: 'calculated',
          baseTime: 2,
          calculationFormula: '1 + (height * width / 2000000)' // Время зависит от размера
        }
      });
      console.log(`✓ Добавлен вид работ: ${cutting.name}`);
    }

    if (assembly) {
      await prisma.productWorkTypeUsage.create({
        data: {
          productId: product.id,
          workTypeId: assembly.id,
          quantity: 6, // 6 часов на сборку
          cost: 0,
          sequence: 2,
          unitType: 'calculated',
          baseTime: 6,
          calculationFormula: '4 + (doorsCount * 0.5) + (shelvesCount * 0.25)' // Время зависит от сложности
        }
      });
      console.log(`✓ Добавлен вид работ: ${assembly.name}`);
    }

    console.log('\n🎉 Шкаф-купе успешно создан с расчетом материалов!');
    console.log(`   Артикул: ${product.sku}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Формула: ${product.formulaExpression}`);
    
    return product;

  } catch (error) {
    console.error('Ошибка при создании шкафа-купе:', error);
    throw error;
  }
}

createWardrobe()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
