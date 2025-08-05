const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllProducts() {
  try {
    console.log('🗑️ Удаляем все товары...');
    
    // Сначала удаляем связанные данные
    console.log('🔗 Удаляем связи материалов с товарами...');
    const deletedMaterialUsages = await prisma.productMaterialUsage.deleteMany({});
    console.log(`✅ Удалено ${deletedMaterialUsages.count} связей материалов`);

    console.log('🔗 Удаляем связи видов работ с товарами...');
    const deletedWorkTypeUsages = await prisma.productWorkTypeUsage.deleteMany({});
    console.log(`✅ Удалено ${deletedWorkTypeUsages.count} связей видов работ`);

    console.log('🔗 Удаляем связи фондов с товарами...');
    const deletedFundUsages = await prisma.productFundUsage.deleteMany({});
    console.log(`✅ Удалено ${deletedFundUsages.count} связей фондов`);

    console.log(' Удаляем товары...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`✅ Удалено ${deletedProducts.count} товаров`);

    console.log('🎉 Все товары успешно удалены!');
    
  } catch (error) {
    console.error('❌ Ошибка при удалении товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProducts();
