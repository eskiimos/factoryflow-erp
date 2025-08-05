const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductCreation() {
  console.log('🧪 Тестирование создания товаров...');

  try {
    // Проверяем доступные данные
    const materials = await prisma.materialItem.findMany({ where: { isActive: true } });
    const workTypes = await prisma.workType.findMany({ where: { isActive: true } });
    const subgroups = await prisma.productSubgroup.findMany({ where: { isActive: true } });
    const categories = await prisma.category.findMany({ where: { isActive: true } });

    console.log(`📊 Доступно:`);
    console.log(`   Материалы: ${materials.length}`);
    console.log(`   Виды работ: ${workTypes.length}`);
    console.log(`   Подгруппы: ${subgroups.length}`);
    console.log(`   Категории: ${categories.length}`);

    if (materials.length > 0) {
      console.log(`\n💰 Примеры материалов:`);
      materials.slice(0, 5).forEach(m => {
        console.log(`   ${m.name}: ${m.price}₽/${m.unit}`);
      });
    }

    if (workTypes.length > 0) {
      console.log(`\n⚙️ Примеры видов работ:`);
      workTypes.slice(0, 3).forEach(w => {
        console.log(`   ${w.name}: ${w.hourlyRate}₽/час`);
      });
    }

    if (subgroups.length > 0) {
      console.log(`\n📦 Доступные подгруппы:`);
      subgroups.forEach(sg => {
        console.log(`   ${sg.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductCreation();
