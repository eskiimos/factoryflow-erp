import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductGroups() {
  console.log('Seeding product groups...');

  // Создаем группы товаров
  const groups = [
    {
      name: 'Мебель',
      description: 'Мебельные изделия',
      subgroups: [
        { name: 'Столы', description: 'Столы различных типов' },
        { name: 'Стулья', description: 'Стулья и кресла' },
        { name: 'Шкафы', description: 'Шкафы и гардеробы' },
      ]
    },
    {
      name: 'Декор',
      description: 'Декоративные изделия',
      subgroups: [
        { name: 'Рамки', description: 'Рамки для картин и фото' },
        { name: 'Вазы', description: 'Декоративные вазы' },
        { name: 'Скульптуры', description: 'Декоративные скульптуры' },
      ]
    },
    {
      name: 'Посуда',
      description: 'Деревянная посуда',
      subgroups: [
        { name: 'Тарелки', description: 'Деревянные тарелки' },
        { name: 'Чашки', description: 'Деревянные чашки' },
        { name: 'Подносы', description: 'Деревянные подносы' },
      ]
    },
    {
      name: 'Игрушки',
      description: 'Деревянные игрушки',
      subgroups: [
        { name: 'Конструкторы', description: 'Деревянные конструкторы' },
        { name: 'Пазлы', description: 'Деревянные пазлы' },
        { name: 'Машинки', description: 'Деревянные машинки' },
      ]
    }
  ];

  for (const groupData of groups) {
    const { subgroups, ...group } = groupData;
    
    const createdGroup = await prisma.productGroup.create({
      data: group
    });

    console.log(`Created group: ${createdGroup.name}`);

    for (const subgroupData of subgroups) {
      const createdSubgroup = await prisma.productSubgroup.create({
        data: {
          ...subgroupData,
          groupId: createdGroup.id
        }
      });

      console.log(`  Created subgroup: ${createdSubgroup.name}`);
    }
  }

  console.log('Product groups seeded successfully!');
}

seedProductGroups()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
