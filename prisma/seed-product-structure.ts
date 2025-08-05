import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductStructure() {
  try {
    // Create product groups
    const signageGroup = await prisma.productGroup.create({
      data: {
        name: 'Наружная реклама',
        description: 'Вывески, баннеры и другие виды наружной рекламы',
        isActive: true,
        subgroups: {
          create: [
            {
              name: 'Вывески',
              description: 'Световые и несветовые вывески',
              isActive: true,
            },
            {
              name: 'Баннеры',
              description: 'Баннеры и баннерные конструкции',
              isActive: true,
            },
          ],
        },
      },
    });

    const interiorGroup = await prisma.productGroup.create({
      data: {
        name: 'Интерьерная реклама',
        description: 'Стенды, таблички и другие виды интерьерной рекламы',
        isActive: true,
        subgroups: {
          create: [
            {
              name: 'Информационные стенды',
              description: 'Стенды для размещения информации',
              isActive: true,
            },
            {
              name: 'Таблички',
              description: 'Офисные и информационные таблички',
              isActive: true,
            },
          ],
        },
      },
    });

    const printGroup = await prisma.productGroup.create({
      data: {
        name: 'Полиграфия',
        description: 'Визитки, флаеры и другая печатная продукция',
        isActive: true,
        subgroups: {
          create: [
            {
              name: 'Визитки',
              description: 'Визитные карточки',
              isActive: true,
            },
            {
              name: 'Флаеры',
              description: 'Рекламные листовки',
              isActive: true,
            },
          ],
        },
      },
    });

    console.log('Product structure created successfully');

  } catch (error) {
    console.error('Error seeding product structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProductStructure();
