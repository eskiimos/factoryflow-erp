const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSimpleProduct() {
  console.log('🏭 Создание простого тестового товара...');

  try {
    // Найдем подгруппу и категорию
    const subgroup = await prisma.productSubgroup.findFirst({
      where: { name: { contains: 'Вывески' } }
    });
    
    const category = await prisma.category.findFirst({
      where: { name: { contains: 'Наружная' } }
    });

    console.log('Найденная подгруппа:', subgroup?.name);
    console.log('Найденная категория:', category?.name);

    if (!subgroup) {
      console.log('❌ Подгруппа не найдена');
      return;
    }

    // Создаем простой товар
    const product = await prisma.product.create({
      data: {
        name: 'Тестовая вывеска',
        description: 'Простая тестовая вывеска для проверки',
        sku: 'TEST001',
        unit: 'см²',
        sellingPrice: 15.50,
        subgroupId: subgroup.id,
        currentStock: 0,
        minStock: 1000,
        maxStock: 10000,
        isActive: true
      }
    });

    console.log('✅ Товар создан:', product.name);
    
    // Проверим что товар сохранился
    const allProducts = await prisma.product.findMany();
    console.log(`📦 Всего товаров в базе: ${allProducts.length}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleProduct();
