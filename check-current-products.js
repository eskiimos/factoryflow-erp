const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('📊 Проверяем текущее состояние товаров...\n');

    // Все товары
    const allProducts = await prisma.product.findMany({
      include: {
        group: true,
        subgroup: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`🔍 Всего товаров в базе: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('\n📦 Список всех товаров:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.sku || 'без артикула'})`);
        console.log(`   Группа: ${product.group?.name || 'не указана'}`);
        console.log(`   Подгруппа: ${product.subgroup?.name || 'не указана'}`);
        console.log(`   Цена: ${product.sellingPrice} ${product.currency}`);
        console.log(`   Активен: ${product.isActive ? 'Да' : 'Нет'}`);
        console.log('');
      });
    }

    // Все группы товаров
    const allGroups = await prisma.productGroup.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📁 Всего групп товаров: ${allGroups.length}`);
    
    if (allGroups.length > 0) {
      console.log('\n📂 Список групп:');
      allGroups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.name} (товаров: ${group._count.products})`);
        console.log(`   Активна: ${group.isActive ? 'Да' : 'Нет'}`);
      });
    }

    // Все подгруппы товаров
    const allSubgroups = await prisma.productSubgroup.findMany({
      include: {
        group: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📂 Всего подгрупп товаров: ${allSubgroups.length}`);
    
    if (allSubgroups.length > 0) {
      console.log('\n📂 Список подгрупп:');
      allSubgroups.forEach((subgroup, index) => {
        console.log(`${index + 1}. ${subgroup.name} (товаров: ${subgroup._count.products})`);
        console.log(`   Группа: ${subgroup.group?.name || 'не указана'}`);
        console.log(`   Активна: ${subgroup.isActive ? 'Да' : 'Нет'}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
