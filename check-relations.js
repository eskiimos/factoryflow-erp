const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRelations() {
  console.log('🔍 Проверка связей товаров...');

  try {
    const products = await prisma.product.findMany({
      include: {
        materialUsages: {
          include: {
            materialItem: true
          }
        },
        workTypeUsages: {
          include: {
            workType: true
          }
        },
        fundUsages: {
          include: {
            fund: true
          }
        }
      }
    });

    for (const product of products) {
      console.log(`\n📦 Товар: ${product.name} (${product.sku})`);
      console.log(`   Цена: ${product.sellingPrice}₽/${product.unit}`);
      
      if (product.materialUsages.length > 0) {
        console.log('   Материалы:');
        product.materialUsages.forEach(usage => {
          console.log(`   - ${usage.materialItem.name}: ${usage.quantity} ${usage.materialItem.unit} (${usage.cost}₽)`);
        });
      }

      if (product.workTypeUsages.length > 0) {
        console.log('   Виды работ:');
        product.workTypeUsages.forEach(usage => {
          console.log(`   - ${usage.workType.name}: ${usage.quantity} часов (${usage.cost}₽)`);
        });
      }

      if (product.fundUsages.length > 0) {
        console.log('   Фонды:');
        product.fundUsages.forEach(usage => {
          console.log(`   - ${usage.fund.name}: ${usage.allocationPercentage}%`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRelations();
