const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixWardrobe() {
  console.log('🔧 Исправляем шкаф-купе: переводы и цены...');
  
  try {
    // Находим наш шкаф-купе
    const product = await prisma.product.findFirst({
      where: { sku: 'SHKAF-KUPE-001' },
      include: { parameters: true }
    });
    
    if (!product) {
      console.log('❌ Продукт SHKAF-KUPE-001 не найден');
      return;
    }
    
    console.log(`✓ Найден продукт: ${product.name}`);
    console.log(`  Параметры: ${product.parameters.length}`);
    
    // 1. Переводим названия параметров
    const translations = {
      'height': 'Высота',
      'width': 'Ширина', 
      'depth': 'Глубина',
      'doorsCount': 'Количество дверей',
      'shelvesCount': 'Количество полок'
    };
    
    for (const param of product.parameters) {
      const newName = translations[param.name];
      if (newName && param.name !== newName) {
        await prisma.productParameter.update({
          where: { id: param.id },
          data: { name: newName }
        });
        console.log(`✓ Переименован: ${param.name} → ${newName}`);
      }
    }
    
    // 2. Обновляем цену продукта
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        basePrice: 25000, // Базовая цена 25 000 руб
        sellingPrice: 32500, // Цена продажи с наценкой 30%
        materialCost: 15000,
        laborCost: 7000,
        overheadCost: 3000,
        totalCost: 25000,
        margin: 30
      }
    });
    
    console.log(`✓ Обновлена цена: ${updatedProduct.sellingPrice} руб`);
    
    // 3. Проверяем материалы и их цены
    const materials = await prisma.materialItem.findMany({
      where: {
        OR: [
          { name: { contains: 'ЛДСП' } },
          { name: { contains: 'Кромка' } }
        ]
      }
    });
    
    console.log(`\n📦 Найдено материалов: ${materials.length}`);
    materials.forEach(mat => {
      console.log(`  - ${mat.name}: ${mat.price} ${mat.currency}`);
    });
    
    console.log('\n🎉 Исправления завершены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

fixWardrobe()
  .finally(() => prisma.$disconnect());
