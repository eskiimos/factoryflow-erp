const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Проверка содержимого базы данных...');

  try {
    const products = await prisma.product.findMany({
      include: {
        subgroup: true
      }
    });

    const materials = await prisma.materialItem.count({ where: { isActive: true } });
    const workTypes = await prisma.workType.count({ where: { isActive: true } });
    const groups = await prisma.productGroup.count({ where: { isActive: true } });
    const subgroups = await prisma.productSubgroup.count({ where: { isActive: true } });

    console.log(`📊 Статистика базы данных:`);
    console.log(`   Товары: ${products.length}`);
    console.log(`   Материалы: ${materials}`);
    console.log(`   Виды работ: ${workTypes}`);
    console.log(`   Группы товаров: ${groups}`);
    console.log(`   Подгруппы товаров: ${subgroups}`);

    if (products.length > 0) {
      console.log(`\n📦 Найденные товары:`);
      products.forEach(product => {
        console.log(`   ${product.name} (${product.sku}) - ${product.sellingPrice}₽/${product.unit}`);
        console.log(`      Группа: ${product.subgroup?.name || 'Не указана'}`);
      });
    } else {
      console.log(`\n❌ Товары в базе не найдены`);
    }

  } catch (error) {
    console.error('❌ Ошибка проверки базы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
