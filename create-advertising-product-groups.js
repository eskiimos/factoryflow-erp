const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProductGroups() {
  console.log('📦 Создание групп товаров для рекламного производства...');

  // Создаем основные группы товаров
  const productGroups = await Promise.all([
    prisma.productGroup.create({
      data: {
        name: 'Наружная реклама',
        description: 'Вывески, баннеры и другие конструкции для наружного применения',
        isActive: true
      }
    }),
    prisma.productGroup.create({
      data: {
        name: 'Интерьерная реклама',
        description: 'Рекламные конструкции для размещения внутри помещений',
        isActive: true
      }
    }),
    prisma.productGroup.create({
      data: {
        name: 'Полиграфическая продукция',
        description: 'Печатная продукция любых форматов',
        isActive: true
      }
    }),
    prisma.productGroup.create({
      data: {
        name: 'Сувенирная продукция',
        description: 'Брендированные сувениры и подарки',
        isActive: true
      }
    }),
    prisma.productGroup.create({
      data: {
        name: 'Цифровые услуги',
        description: 'Дизайн, проектирование и согласование',
        isActive: true
      }
    }),
  ]);

  console.log(`✅ Создано ${productGroups.length} основных групп товаров`);

  // Создаем подгруппы для каждой основной группы
  const naruzhkaSubgroups = await Promise.all([
    prisma.productSubgroup.create({
      data: {
        name: 'Вывески',
        description: 'Фасадные и крышные вывески',
        groupId: productGroups[0].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Баннеры и растяжки',
        description: 'Баннеры на фасадах и перетяжки',
        productGroupId: productGroups[0].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Световые короба',
        description: 'Лайтбоксы с внутренней подсветкой',
        productGroupId: productGroups[0].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Стелы и пилоны',
        description: 'Отдельностоящие рекламные конструкции',
        productGroupId: productGroups[0].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Крышные установки',
        description: 'Рекламные конструкции на крышах',
        productGroupId: productGroups[0].id,
        isActive: true
      }
    }),
  ]);

  const interierSubgroups = await Promise.all([
    prisma.productSubgroup.create({
      data: {
        name: 'Таблички и указатели',
        description: 'Информационные таблички и указатели',
        productGroupId: productGroups[1].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Стенды и витрины',
        description: 'Информационные стенды и витрины',
        productGroupId: productGroups[1].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'POS-материалы',
        description: 'Рекламные материалы в местах продаж',
        productGroupId: productGroups[1].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Ресепшн и брендирование',
        description: 'Оформление зон ресепшн и фирменные элементы',
        productGroupId: productGroups[1].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Выставочное оборудование',
        description: 'Стенды и оборудование для выставок',
        productGroupId: productGroups[1].id,
        isActive: true
      }
    }),
  ]);

  const polygraphSubgroups = await Promise.all([
    prisma.productSubgroup.create({
      data: {
        name: 'Визитки и пластиковые карты',
        description: 'Визитные карточки и дисконтные карты',
        productGroupId: productGroups[2].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Листовки и флаеры',
        description: 'Рекламные листовки и флаеры',
        productGroupId: productGroups[2].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Каталоги и брошюры',
        description: 'Многостраничные печатные издания',
        productGroupId: productGroups[2].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Плакаты и постеры',
        description: 'Крупноформатная печатная продукция',
        productGroupId: productGroups[2].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Буклеты и лифлеты',
        description: 'Складные буклеты с различными видами фальцовки',
        productGroupId: productGroups[2].id,
        isActive: true
      }
    }),
  ]);

  const souvenirSubgroups = await Promise.all([
    prisma.productSubgroup.create({
      data: {
        name: 'Ручки и канцелярия',
        description: 'Брендированные ручки и канцелярские принадлежности',
        productGroupId: productGroups[3].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Текстиль',
        description: 'Брендированная одежда и текстильные изделия',
        productGroupId: productGroups[3].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Посуда и кружки',
        description: 'Брендированная посуда и кружки',
        productGroupId: productGroups[3].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Электроника',
        description: 'Брендированные гаджеты и электроника',
        productGroupId: productGroups[3].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'VIP-подарки',
        description: 'Эксклюзивные брендированные подарки',
        productGroupId: productGroups[3].id,
        isActive: true
      }
    }),
  ]);

  const digitalSubgroups = await Promise.all([
    prisma.productSubgroup.create({
      data: {
        name: 'Дизайн услуги',
        description: 'Услуги графического дизайна',
        productGroupId: productGroups[4].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: '3D-моделирование',
        description: 'Разработка 3D-моделей и визуализаций',
        productGroupId: productGroups[4].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Проектирование конструкций',
        description: 'Проектирование сложных рекламных конструкций',
        productGroupId: productGroups[4].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Согласование рекламы',
        description: 'Услуги согласования рекламных конструкций',
        productGroupId: productGroups[4].id,
        isActive: true
      }
    }),
    prisma.productSubgroup.create({
      data: {
        name: 'Брендбуки и гайдлайны',
        description: 'Разработка фирменного стиля и правил его использования',
        productGroupId: productGroups[4].id,
        isActive: true
      }
    }),
  ]);

  const allSubgroups = [
    ...naruzhkaSubgroups,
    ...interierSubgroups,
    ...polygraphSubgroups,
    ...souvenirSubgroups,
    ...digitalSubgroups
  ];

  console.log(`✅ Создано ${allSubgroups.length} подгрупп товаров`);

  await prisma.$disconnect();
  return {
    groups: productGroups,
    subgroups: allSubgroups
  };
}

if (require.main === module) {
  createProductGroups()
    .catch((e) => {
      console.error('❌ Ошибка создания групп товаров:', e);
      process.exit(1);
    });
}

module.exports = { createProductGroups };
