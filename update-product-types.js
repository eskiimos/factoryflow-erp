const { PrismaClient } = require('@prisma/client');

async function updateProductTypes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Проверяем типы существующих товаров...');
    
    // Проверяем статистику по типам
    const typeCounts = await prisma.product.groupBy({
      by: ['productType'],
      _count: {
        id: true
      }
    });
    
    console.log('Статистика по типам товаров:');
    typeCounts.forEach(({ productType, _count }) => {
      console.log(`- ${productType}: ${_count.id} товаров`);
    });
    
    // Получаем общее количество товаров
    const totalProducts = await prisma.product.count();
    console.log(`\nВсего товаров в базе: ${totalProducts}`);
    
  } catch (error) {
    console.error('Ошибка при проверке типов товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductTypes();
