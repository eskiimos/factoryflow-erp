const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVolumetricLettersProduct() {
  try {
    console.log('🔍 Получаем данные для создания товара...\n');
    
    // Получаем все необходимые данные
    const materials = await prisma.materialItem.findMany({ 
      where: { isActive: true },
      include: { category: true }
    });
    
    const workTypes = await prisma.workType.findMany({ 
      where: { isActive: true },
      include: { department: true }
    });
    
    const funds = await prisma.fund.findMany({ 
      where: { isActive: true },
      include: {
        categories: true
      }
    });
    
    const categories = await prisma.category.findMany({ 
      where: { isActive: true }
    });

    // Находим подходящую категорию для товара
    let productCategory = categories.find(c => c.name.includes('Световые') || c.name.includes('Реклам'));
    if (!productCategory) {
      // Создаем категорию для световых конструкций
      productCategory = await prisma.category.create({
        data: {
          name: "Световые конструкции",
          description: "Объемные буквы, световые короба и другие рекламные конструкции с подсветкой",
          isActive: true
        }
      });
      console.log('✅ Создана категория: Световые конструкции');
    }

    console.log('📦 Создаем товар "Объемные буквы с торцевой подсветкой BLZ 0+0 851-950"...\n');

    // Создаем товар
    const product = await prisma.product.create({
      data: {
        name: "Объемные буквы с торцевой подсветкой BLZ 0+0 851-950",
        description: "Объемные буквы с торцевой LED подсветкой. Корпус из АКП 3мм, лицевая часть из молочного акрила 2мм, торцевая подсветка светодиодной лентой 12Вт. Размер букв высота 851-950мм.",
        sku: "BLZ-851-950-LED",
        unit: "шт",
        type: "PRODUCT",
        pricingMethod: "FIXED",
        baseUnit: "шт",
        basePrice: 0,
        minimumOrder: 1,
        materialCost: 0,
        laborCost: 0, 
        overheadCost: 0,
        totalCost: 0,
        sellingPrice: 0,
        margin: 0,
        currency: "RUB",
        productionTime: 0,
        currentStock: 0,
        minStock: 1,
        maxStock: 10,
        tags: JSON.stringify(["объемные буквы", "подсветка", "LED", "реклама"]),
        specifications: JSON.stringify({
          "Высота букв": "851-950 мм",
          "Материал корпуса": "АКП 3мм",
          "Материал лицевой части": "Акрил молочный 2мм",
          "Тип подсветки": "Светодиодная лента 12Вт",
          "Место подсветки": "Торцевая"
        }),
        isActive: true
      }
    });

    console.log('✅ Создан товар:', product.name);

    // Материалы для объемных букв (примерные расчеты для буквы высотой ~900мм)
    const materialUsages = [
      {
        material: materials.find(m => m.name.includes('АКП 3мм')),
        quantity: 2.5 // м2 - для корпуса буквы
      },
      {
        material: materials.find(m => m.name.includes('Акрил 2мм')),
        quantity: 0.8 // м2 - для лицевой части
      },
      {
        material: materials.find(m => m.name.includes('Светодиодная лента')),
        quantity: 4.0 // пог.м - для торцевой подсветки
      },
      {
        material: materials.find(m => m.name.includes('Блок питания')),
        quantity: 60 // вт - блок питания 60Вт
      },
      {
        material: materials.find(m => m.name.includes('Провод швв 2х0,5мм')),
        quantity: 3.0 // пог.м - для подключения
      },
      {
        material: materials.find(m => m.name.includes('Клемма Ваго')),
        quantity: 6 // шт - для соединений
      },
      {
        material: materials.find(m => m.name.includes('Саморез 19 мм')),
        quantity: 20 // шт - для крепления
      },
      {
        material: materials.find(m => m.name.includes('Клей')),
        quantity: 50 // мг - космофен для склейки
      }
    ];

    let totalMaterialCost = 0;
    console.log('\n🧱 Добавляем материалы:');
    
    for (const usage of materialUsages) {
      if (usage.material) {
        const cost = usage.material.price * usage.quantity;
        totalMaterialCost += cost;
        
        await prisma.productMaterialUsage.create({
          data: {
            productId: product.id,
            materialItemId: usage.material.id,
            quantity: usage.quantity,
            cost: cost
          }
        });
        
        console.log(` - ${usage.material.name}: ${usage.quantity} ${usage.material.unit} × ${usage.material.price} = ${cost.toFixed(2)} руб`);
      }
    }

    // Виды работ для объемных букв
    const workTypeUsages = [
      {
        workType: workTypes.find(w => w.name.includes('Подготовка файла на фрезеровку')),
        estimatedTime: 2.0 // часа
      },
      {
        workType: workTypes.find(w => w.name.includes('Фрезеровка АКП')),
        estimatedTime: 12.0 // пог.м (периметр буквы ~12м)
      },
      {
        workType: workTypes.find(w => w.name.includes('Фрезеровка Акрила')),
        estimatedTime: 4.0 // пог.м (контур лицевой части)
      },
      {
        workType: workTypes.find(w => w.name.includes('Сборка элементов')),
        estimatedTime: 4.0 // пог.м (сборка корпуса)
      },
      {
        workType: workTypes.find(w => w.name.includes('Проклейка светодиодной ленты')),
        estimatedTime: 4.0 // пог.м
      },
      {
        workType: workTypes.find(w => w.name.includes('Соединения проводов')),
        estimatedTime: 4 // шт соединений
      },
      {
        workType: workTypes.find(w => w.name.includes('Подготовка шаблона под раскидку светодиодов')),
        estimatedTime: 1.0 // час
      }
    ];

    let totalLaborCost = 0;
    let totalProductionTime = 0;
    console.log('\n🛠️ Добавляем виды работ:');
    
    for (const usage of workTypeUsages) {
      if (usage.workType) {
        const cost = usage.workType.hourlyRate * usage.estimatedTime;
        totalLaborCost += cost;
        totalProductionTime += usage.estimatedTime;
        
        await prisma.productWorkTypeUsage.create({
          data: {
            productId: product.id,
            workTypeId: usage.workType.id,
            quantity: usage.estimatedTime,
            cost: cost
          }
        });
        
        console.log(` - ${usage.workType.name}: ${usage.estimatedTime} ${usage.workType.unit} × ${usage.workType.hourlyRate} = ${cost.toFixed(2)} руб`);
      }
    }

    // Фонды (накладные расходы)
    let totalOverheadCost = 0;
    console.log('\n💰 Добавляем фонды:');
    
    if (funds.length > 0) {
      const fund = funds[0];
      const allocationPercentage = 15; // 15% от общей стоимости материалов и работ
      const overheadCost = (totalMaterialCost + totalLaborCost) * (allocationPercentage / 100);
      totalOverheadCost += overheadCost;
      
      // Используем первую доступную категорию фонда
      const firstCategory = fund.categories && fund.categories.length > 0 ? fund.categories[0] : null;
      
      if (firstCategory) {
        await prisma.productFundUsage.create({
          data: {
            productId: product.id,
            fundId: fund.id,
            categoryId: firstCategory.id,
            allocatedAmount: overheadCost,
            percentage: allocationPercentage,
            description: "Накладные расходы на производство"
          }
        });
        
        console.log(` - ${fund.name} (${firstCategory.name}): ${allocationPercentage}% = ${overheadCost.toFixed(2)} руб`);
      } else {
        console.log(` - ${fund.name}: категории не найдены, пропускаем`);
      }
    }

    // Рассчитываем итоговую стоимость
    const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;
    const margin = 25; // 25% маржа
    const sellingPrice = totalCost * (1 + margin / 100);

    // Обновляем товар с рассчитанными данными
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        materialCost: Math.round(totalMaterialCost * 100) / 100,
        laborCost: Math.round(totalLaborCost * 100) / 100,
        overheadCost: Math.round(totalOverheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        sellingPrice: Math.round(sellingPrice * 100) / 100,
        margin: margin,
        productionTime: totalProductionTime
      }
    });

    console.log('\n📊 ИТОГОВЫЕ РАСЧЕТЫ:');
    console.log('═══════════════════════════════════════');
    console.log(`💰 Материалы: ${totalMaterialCost.toFixed(2)} руб`);
    console.log(`⚒️  Работы: ${totalLaborCost.toFixed(2)} руб`);
    console.log(`🏢 Накладные (${funds.length > 0 ? '15%' : '0%'}): ${totalOverheadCost.toFixed(2)} руб`);
    console.log(`📦 Себестоимость: ${totalCost.toFixed(2)} руб`);
    console.log(`💵 Цена продажи (+${margin}%): ${sellingPrice.toFixed(2)} руб`);
    console.log(`⏱️  Время производства: ${totalProductionTime.toFixed(1)} часов`);
    console.log('═══════════════════════════════════════');
    
    console.log(`\n🎉 Товар "${updatedProduct.name}" успешно создан!`);
    console.log(`📋 Артикул: ${updatedProduct.sku}`);
    console.log(`🔗 ID: ${updatedProduct.id}`);
    
  } catch (error) {
    console.error('❌ Ошибка при создании товара:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createVolumetricLettersProduct();
