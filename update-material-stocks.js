const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Остатки материалов для рекламного производства
const materialStocks = {
  // Баннерные материалы
  'Баннерная ткань 440 г/м²': { current: 37, min: 5, max: 200 },
  'Баннерная ткань 510 г/м²': { current: 104, min: 5, max: 200 },
  'Сетка баннерная 230 г/м²': { current: 35, min: 5, max: 200 },
  'Mesh-баннер 270 г/м²': { current: 60, min: 5, max: 200 },
  
  // Печатные материалы
  'Самоклеящаяся пленка белая': { current: 91, min: 10, max: 300 },
  'Фотобумага глянцевая 200 г/м²': { current: 86, min: 8, max: 150 },
  'Холст для печати 350 г/м²': { current: 106, min: 12, max: 200 },
  'Бумага для плакатов 150 г/м²': { current: 11, min: 5, max: 100 },
  
  // Пленки и покрытия
  'Оракал 641 (цветная пленка)': { current: 91, min: 15, max: 250 },
  'Пленка прозрачная защитная': { current: 24, min: 8, max: 150 },
  'Антигравийная пленка': { current: 79, min: 10, max: 120 },
  'Пленка One Way Vision': { current: 21, min: 5, max: 80 },
  
  // Крепеж и фурнитура
  'Люверсы металлические 12мм': { current: 460, min: 50, max: 1000 },
  'Карабины для баннеров': { current: 230, min: 30, max: 500 },
  'Стяжки нейлоновые 200мм': { current: 33, min: 10, max: 100 },
  'Профиль алюминиевый 20x20': { current: 58, min: 20, max: 200 },
  'Саморезы с пресс-шайбой': { current: 102, min: 25, max: 300 },
  
  // Световые материалы
  'Акрил молочный 3мм': { current: 53, min: 8, max: 150 },
  'Акрил прозрачный 5мм': { current: 92, min: 10, max: 180 },
  'LED лента 12V белая': { current: 28, min: 10, max: 100 },
  'Блок питания 12V 100W': { current: 96, min: 15, max: 200 },
  'Неон гибкий 12V': { current: 46, min: 12, max: 150 },
};

async function updateMaterialStocks() {
  console.log('📦 Обновляем остатки материалов...');
  
  let updatedCount = 0;
  
  for (const [materialName, stocks] of Object.entries(materialStocks)) {
    try {
      // Ищем материал по имени
      const material = await prisma.materialItem.findFirst({
        where: { 
          name: materialName,
          isActive: true 
        }
      });
      
      if (material) {
        // Обновляем остатки
        await prisma.materialItem.update({
          where: { id: material.id },
          data: {
            currentStock: stocks.current,
            criticalMinimum: stocks.min,
            satisfactoryLevel: stocks.max,
          }
        });
        
        console.log(`✅ Обновлен ${materialName}: текущий ${stocks.current}, мин ${stocks.min}, макс ${stocks.max}`);
        updatedCount++;
      } else {
        console.log(`⚠️  Материал не найден: ${materialName}`);
      }
    } catch (error) {
      console.error(`⚠️  Ошибка при обновлении ${materialName}:`, error.message);
    }
  }
  
  console.log(`🎉 Успешно обновлено остатков: ${updatedCount} материалов`);
  
  // Показываем статистику по критическим остаткам
  const criticalMaterials = await prisma.materialItem.findMany({
    where: {
      isActive: true,
      currentStock: {
        lte: prisma.materialItem.fields.criticalMinimum
      }
    },
    select: {
      name: true,
      currentStock: true,
      criticalMinimum: true,
      unit: true
    }
  });
  
  if (criticalMaterials.length > 0) {
    console.log('\n⚠️  Материалы с критическими остатками:');
    criticalMaterials.forEach(material => {
      console.log(`   📋 ${material.name}: ${material.currentStock} ${material.unit} (мин: ${material.criticalMinimum})`);
    });
  } else {
    console.log('\n✅ Все материалы в норме - критических остатков нет');
  }
}

updateMaterialStocks()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
