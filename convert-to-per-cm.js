const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertToPerCm() {
  console.log('🔄 Пересчитываем товар на стоимость за сантиметр...');
  
  try {
    // Находим товар объемные буквы
    const product = await prisma.product.findFirst({
      where: { sku: 'BLZ-851-950-LED' }
    });
    
    if (!product) {
      console.log('❌ Товар не найден');
      return;
    }
    
    console.log('📦 Найден товар:', product.name);
    console.log('💰 Текущая цена:', product.sellingPrice, 'руб');
    
    // Размеры из названия: 851-950 мм
    // Периметр = (851 + 950) * 2 = 3602 мм = 360.2 см
    const width = 950; // мм
    const height = 851; // мм  
    const perimeter = (width + height) * 2 / 10; // переводим в см
    
    console.log('📏 Периметр букв:', perimeter, 'см');
    
    // Рассчитываем стоимость за сантиметр
    const pricePerCm = product.sellingPrice / perimeter;
    const costPerCm = product.totalCost / perimeter;
    
    console.log('💵 Стоимость за см (продажа):', pricePerCm.toFixed(2), 'руб/см');
    console.log('💸 Себестоимость за см:', costPerCm.toFixed(2), 'руб/см');
    
    // Обновляем товар для ценообразования за сантиметр
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: 'Объемные буквы с торцевой подсветкой BLZ (базовая цена за см)',
        description: 'Объемные буквы с торцевой подсветкой из АКП с акриловым бортом. Цена указана за 1 см периметра букв. Минимальный заказ: 100 см',
        pricingMethod: 'PER_UNIT',
        baseUnit: 'см',
        basePrice: Math.round(pricePerCm * 100) / 100, // округляем до копеек
        minimumOrder: 100, // минимум 100 см
        sellingPrice: Math.round(pricePerCm * 100) / 100,
        
        // Пересчитываем все стоимости на сантиметр
        materialCost: Math.round(product.materialCost / perimeter * 100) / 100,
        laborCost: Math.round(product.laborCost / perimeter * 100) / 100,
        overheadCost: Math.round(product.overheadCost / perimeter * 100) / 100,
        totalCost: Math.round(product.totalCost / perimeter * 100) / 100,
        
        // Время производства на см
        productionTime: Math.round(product.productionTime / perimeter * 100) / 100,
        
        // Теги для поиска
        tags: JSON.stringify(['объемные буквы', 'подсветка', 'АКП', 'акрил', 'за сантиметр'])
      }
    });
    
    console.log('✅ Товар обновлен!');
    console.log('📊 Новые параметры:');
    console.log('   - Название:', updatedProduct.name);
    console.log('   - Метод ценообразования:', updatedProduct.pricingMethod);
    console.log('   - Базовая единица:', updatedProduct.baseUnit);
    console.log('   - Цена за см:', updatedProduct.basePrice, 'руб/см');
    console.log('   - Минимальный заказ:', updatedProduct.minimumOrder, 'см');
    console.log('   - Материалы за см:', updatedProduct.materialCost, 'руб/см');
    console.log('   - Работы за см:', updatedProduct.laborCost, 'руб/см');
    console.log('   - Накладные за см:', updatedProduct.overheadCost, 'руб/см');
    console.log('   - Себестоимость за см:', updatedProduct.totalCost, 'руб/см');
    console.log('   - Время на см:', updatedProduct.productionTime, 'ч/см');
    
    console.log('\n💡 Теперь можно рассчитать любой размер:');
    console.log('   Пример: буквы 1000x500 мм = периметр 300 см');
    console.log('   Стоимость: 300 × ' + updatedProduct.basePrice + ' = ' + (300 * updatedProduct.basePrice).toFixed(2) + ' руб');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertToPerCm().catch(console.error);
