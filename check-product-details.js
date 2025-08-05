const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductDetails() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        group: { select: { name: true } },
        subgroup: { select: { name: true } },
        materialUsages: {
          include: {
            materialItem: { select: { name: true, unit: true, price: true } }
          }
        },
        workTypeUsages: {
          include: {
            workType: { select: { name: true, unit: true, hourlyRate: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`=== НАЙДЕНО ПРОДУКТОВ: ${products.length} ===\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Группа: ${product.group?.name} / ${product.subgroup?.name}`);
      console.log(`   Единица: ${product.unit} (базовая: ${product.baseUnit})`);
      console.log(`   Себестоимость: ${product.totalCost} руб`);
      console.log(`   Цена продажи: ${product.sellingPrice} руб`);
      console.log(`   Маржа: ${product.margin}%`);
      console.log(`   Время производства: ${product.productionTime} ч`);
      
      console.log(`   Материалы (${product.materialUsages.length}):`);
      product.materialUsages.forEach(usage => {
        console.log(`     - ${usage.materialItem.name}: ${usage.quantity} ${usage.materialItem.unit} × ${usage.materialItem.price} = ${Math.round(usage.cost)} руб`);
      });
      
      console.log(`   Виды работ (${product.workTypeUsages.length}):`);
      product.workTypeUsages.forEach(usage => {
        console.log(`     - ${usage.workType.name}: ${usage.quantity} ч × ${usage.workType.hourlyRate} = ${Math.round(usage.cost)} руб`);
      });
      
      console.log('');
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductDetails();
