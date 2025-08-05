const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createComplexProduct() {
  try {
    // Получаем фонды
    const funds = await prisma.fund.findMany({
      where: { isActive: true },
      include: { categories: true }
    });

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

    console.log('Найдено фондов:', funds.length);
    
    // Создаем сложный продукт с использованием фондов
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    const group = groups.find(g => g.name === 'Наружная реклама');
    const subgroup = group?.subgroups[0];

    // Материалы для объемных букв 50см высотой (комплект 5 букв)
    const productMaterials = [
      { name: 'Акрил 5мм прозрачный', quantityPerUnit: 2.5 }, // 2.5 м² акрила
      { name: 'Композит 4мм белый', quantityPerUnit: 1.5 }, // подложка
      { name: 'Алюминиевый профиль 30x30мм', quantityPerUnit: 15 }, // каркас
      { name: 'Соединитель угловой 30мм', quantityPerUnit: 20 },
      { name: 'Саморез 4x16мм', quantityPerUnit: 50 },
    ];

    // Виды работ
    const productWorkTypes = [
      { name: 'Разработка логотипа', timePerUnit: 6 }, // сложный дизайн
      { name: 'Фрезеровка ЧПУ', timePerUnit: 8 }, // резка букв
      { name: 'Сварка металлоконструкций', timePerUnit: 4 }, // сборка каркаса
      { name: 'Электромонтажные работы', timePerUnit: 5 }, // LED подсветка
      { name: 'Покраска изделий', timePerUnit: 3 }, // покраска профиля
      { name: 'Высотные работы', timePerUnit: 6 }, // монтаж на высоте
    ];

    // Рассчитываем стоимости
    let materialCost = 0;
    const materialUsages = [];
    
    for (const matDef of productMaterials) {
      const material = materials.find(m => m.name === matDef.name);
      if (material) {
        const cost = material.price * matDef.quantityPerUnit;
        materialCost += cost;
        
        materialUsages.push({
          materialItemId: material.id,
          quantity: matDef.quantityPerUnit,
          cost: cost,
          unitType: 'fixed'
        });
      }
    }

    let laborCost = 0;
    let totalTime = 0;
    const workTypeUsages = [];
    
    for (const workDef of productWorkTypes) {
      const workType = workTypes.find(w => w.name === workDef.name);
      if (workType) {
        const cost = workType.hourlyRate * workDef.timePerUnit;
        laborCost += cost;
        totalTime += workDef.timePerUnit;
        
        workTypeUsages.push({
          workTypeId: workType.id,
          quantity: workDef.timePerUnit,
          cost: cost,
          unitType: 'fixed'
        });
      }
    }

    // Добавляем накладные расходы (фонды) - 15% от прямых затрат
    const directCosts = materialCost + laborCost;
    const overheadCost = directCosts * 0.15;
    
    const totalCost = materialCost + laborCost + overheadCost;
    const sellingPrice = totalCost * 1.5; // наценка 50%
    const margin = ((sellingPrice - totalCost) / sellingPrice) * 100;

    // Создаем продукт с фондами
    const fundUsages = [];
    if (funds.length > 0) {
      const fund = funds[0];
      const category = fund.categories[0];
      
      if (category) {
        fundUsages.push({
          fundId: fund.id,
          categoryId: category.id,
          allocatedAmount: overheadCost,
          percentage: 15,
          description: 'Накладные расходы (аренда, электричество, амортизация)'
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: 'Объемные буквы LED 50см (комплект 5 букв)',
        description: 'Объемные световые буквы высотой 50см с LED подсветкой, комплект из 5 букв',
        sku: `COMPLEX-${timestamp}-${random}`,
        unit: 'комплект',
        baseUnit: 'комплект',
        type: 'PRODUCT',
        pricingMethod: 'CALCULATED',
        basePrice: totalCost,
        sellingPrice: Math.round(sellingPrice),
        materialCost: Math.round(materialCost),
        laborCost: Math.round(laborCost),
        overheadCost: Math.round(overheadCost),
        totalCost: Math.round(totalCost),
        margin: Math.round(margin * 100) / 100,
        productionTime: totalTime,
        groupId: group.id,
        subgroupId: subgroup?.id,
        isActive: true,
        currentStock: 2,
        minStock: 1,
        maxStock: 5,
        specifications: JSON.stringify({
          height: '50см',
          material: 'Акрил + алюминий',
          lighting: 'LED',
          installation: 'Настенный монтаж',
          warranty: '24 месяца'
        }),
        materialUsages: {
          create: materialUsages
        },
        workTypeUsages: {
          create: workTypeUsages
        },
        fundUsages: {
          create: fundUsages
        }
      }
    });

    console.log(`✅ Создан сложный продукт: ${product.name}`);
    console.log(`   Материалы: ${Math.round(materialCost)} руб`);
    console.log(`   Работы: ${Math.round(laborCost)} руб (${totalTime} ч)`);
    console.log(`   Накладные: ${Math.round(overheadCost)} руб`);
    console.log(`   Себестоимость: ${Math.round(totalCost)} руб`);
    console.log(`   Цена продажи: ${Math.round(sellingPrice)} руб`);
    console.log(`   Маржа: ${Math.round(margin)}%`);
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createComplexProduct();
