const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculateLettersPrice(width, height) {
  console.log(`📏 Расчет стоимости объемных букв ${width}×${height} мм`);
  
  try {
    // Находим базовый товар (цена за см)
    const baseProduct = await prisma.product.findFirst({
      where: { 
        sku: 'BLZ-851-950-LED',
        pricingMethod: 'PER_UNIT',
        baseUnit: 'см'
      }
    });
    
    if (!baseProduct) {
      console.log('❌ Базовый товар не найден');
      return;
    }
    
    // Рассчитываем периметр
    const perimeter = (width + height) * 2 / 10; // переводим в см
    
    // Рассчитываем стоимости
    const materialCost = baseProduct.materialCost * perimeter;
    const laborCost = baseProduct.laborCost * perimeter;
    const overheadCost = baseProduct.overheadCost * perimeter;
    const totalCost = baseProduct.totalCost * perimeter;
    const sellingPrice = baseProduct.basePrice * perimeter;
    const productionTime = baseProduct.productionTime * perimeter;
    
    console.log('');
    console.log('📊 РАСЧЕТ СТОИМОСТИ:');
    console.log('═══════════════════════════════════════');
    console.log(`📐 Размер: ${width}×${height} мм`);
    console.log(`📏 Периметр: ${perimeter} см`);
    console.log('');
    console.log('💰 СЕБЕСТОИМОСТЬ:');
    console.log(`   Материалы: ${materialCost.toFixed(2)} руб (${baseProduct.materialCost} × ${perimeter})`);
    console.log(`   Работы: ${laborCost.toFixed(2)} руб (${baseProduct.laborCost} × ${perimeter})`);
    console.log(`   Накладные: ${overheadCost.toFixed(2)} руб (${baseProduct.overheadCost} × ${perimeter})`);
    console.log(`   ИТОГО: ${totalCost.toFixed(2)} руб`);
    console.log('');
    console.log('💵 ПРОДАЖНАЯ ЦЕНА:');
    console.log(`   ${sellingPrice.toFixed(2)} руб (${baseProduct.basePrice} × ${perimeter})`);
    console.log('');
    console.log('📈 ПРИБЫЛЬ:');
    console.log(`   ${(sellingPrice - totalCost).toFixed(2)} руб (${(((sellingPrice - totalCost) / totalCost) * 100).toFixed(1)}%)`);
    console.log('');
    console.log('⏱️ ВРЕМЯ ПРОИЗВОДСТВА:');
    console.log(`   ${productionTime.toFixed(2)} часов (${(productionTime / 8).toFixed(1)} рабочих дня)`);
    console.log('═══════════════════════════════════════');
    
    return {
      dimensions: `${width}×${height}`,
      perimeter,
      costs: {
        materials: materialCost,
        labor: laborCost,
        overhead: overheadCost,
        total: totalCost
      },
      sellingPrice,
      profit: sellingPrice - totalCost,
      profitMargin: ((sellingPrice - totalCost) / totalCost) * 100,
      productionTime
    };
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Примеры расчетов
async function runExamples() {
  console.log('🎯 ПРИМЕРЫ РАСЧЕТОВ ОБЪЕМНЫХ БУКВ\n');
  
  const examples = [
    [500, 300],   // Маленькие буквы
    [851, 950],   // Исходный размер 
    [1000, 500],  // Средние буквы
    [1500, 800],  // Большие буквы
    [2000, 1000]  // Очень большие буквы
  ];
  
  for (const [width, height] of examples) {
    await calculateLettersPrice(width, height);
    console.log('\n');
  }
}

// Если скрипт запущен напрямую
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    // Расчет для конкретного размера
    const width = parseInt(args[0]);
    const height = parseInt(args[1]);
    calculateLettersPrice(width, height).catch(console.error);
  } else {
    // Показать примеры
    runExamples().catch(console.error);
  }
}
