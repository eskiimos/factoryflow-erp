const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearProducts() {
  try {
    await prisma.productMaterialUsage.deleteMany();
    await prisma.productWorkTypeUsage.deleteMany();
    await prisma.productFundUsage.deleteMany();
    await prisma.product.deleteMany();
    
    console.log('✅ Все товары и их связи удалены');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearProducts();
