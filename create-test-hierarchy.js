const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestHierarchy() {
  console.log('Создание тестовой иерархии групп и подгрупп...');

  try {
    // Создаем основную группу "Мебель"
    const furnitureGroup = await prisma.productGroup.upsert({
      where: { name: 'Мебель' },
      update: {},
      create: {
        name: 'Мебель',
        description: 'Все виды мебели для дома и офиса',
        isActive: true
      }
    });

    // Создаем подгруппы первого уровня
    const officeSubgroup = await prisma.productSubgroup.upsert({
      where: { 
        groupId_name: {
          groupId: furnitureGroup.id,
          name: 'Офисная мебель'
        }
      },
      update: {},
      create: {
        name: 'Офисная мебель',
        description: 'Мебель для офисных помещений',
        groupId: furnitureGroup.id,
        isActive: true
      }
    });

    const homeSubgroup = await prisma.productSubgroup.upsert({
      where: { 
        groupId_name: {
          groupId: furnitureGroup.id,
          name: 'Домашняя мебель'
        }
      },
      update: {},
      create: {
        name: 'Домашняя мебель',
        description: 'Мебель для дома',
        groupId: furnitureGroup.id,
        isActive: true
      }
    });

    // Создаем под-подгруппы (второй уровень)
    const tablesSubSubgroup = await prisma.productSubgroup.upsert({
      where: {
        groupId_name: {
          groupId: furnitureGroup.id,
          name: 'Столы'
        }
      },
      update: {},
      create: {
        name: 'Столы',
        description: 'Различные виды столов',
        groupId: furnitureGroup.id,
        parentId: officeSubgroup.id,
        isActive: true
      }
    });

    const chairsSubSubgroup = await prisma.productSubgroup.upsert({
      where: {
        groupId_name: {
          groupId: furnitureGroup.id,
          name: 'Стулья и кресла'
        }
      },
      update: {},
      create: {
        name: 'Стулья и кресла',
        description: 'Офисные стулья и кресла',
        groupId: furnitureGroup.id,
        parentId: officeSubgroup.id,
        isActive: true
      }
    });

    const bedroomSubSubgroup = await prisma.productSubgroup.upsert({
      where: {
        groupId_name: {
          groupId: furnitureGroup.id,
          name: 'Спальная мебель'
        }
      },
      update: {},
      create: {
        name: 'Спальная мебель',
        description: 'Мебель для спальни',
        groupId: furnitureGroup.id,
        parentId: homeSubgroup.id,
        isActive: true
      }
    });

    // Создаем несколько товаров для тестирования
    await prisma.product.createMany({
      data: [
        {
          name: 'Письменный стол офисный',
          description: 'Стол для офисных работников',
          sku: 'DESK-001',
          unit: 'шт',
          sellingPrice: 15000,
          currency: 'RUB',
          groupId: furnitureGroup.id,
          subgroupId: tablesSubSubgroup.id,
          isActive: true
        },
        {
          name: 'Кресло руководителя',
          description: 'Кожаное кресло для руководителя',
          sku: 'CHAIR-001',
          unit: 'шт',
          sellingPrice: 25000,
          currency: 'RUB',
          groupId: furnitureGroup.id,
          subgroupId: chairsSubSubgroup.id,
          isActive: true
        },
        {
          name: 'Кровать двуспальная',
          description: 'Деревянная двуспальная кровать',
          sku: 'BED-001',
          unit: 'шт',
          sellingPrice: 35000,
          currency: 'RUB',
          groupId: furnitureGroup.id,
          subgroupId: bedroomSubSubgroup.id,
          isActive: true
        }
      ]
    });

    console.log('✅ Тестовая иерархия создана:');
    console.log('📁 Мебель');
    console.log('  📂 Офисная мебель');
    console.log('    📄 Столы (1 товар)');
    console.log('    📄 Стулья и кресла (1 товар)');
    console.log('  📂 Домашняя мебель');
    console.log('    📄 Спальная мебель (1 товар)');

  } catch (error) {
    console.error('❌ Ошибка создания тестовой иерархии:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestHierarchy();
