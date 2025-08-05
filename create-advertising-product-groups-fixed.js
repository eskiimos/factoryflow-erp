const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProductGroupsFixed() {
  console.log('📦 Создание групп товаров для рекламного производства...');

  // Создаем основные группы товаров
  const productGroups = await Promise.all([
    prisma.productGroup.upsert({
      where: { name: 'Наружная реклама' },
      update: {},
      create: {
        name: 'Наружная реклама',
        description: 'Вывески, баннеры и другие конструкции для наружного применения',
        isActive: true
      }
    }),
    prisma.productGroup.upsert({
      where: { name: 'Интерьерная реклама' },
      update: {},
      create: {
        name: 'Интерьерная реклама',
        description: 'Рекламные конструкции для размещения внутри помещений',
        isActive: true
      }
    }),
    prisma.productGroup.upsert({
      where: { name: 'Полиграфическая продукция' },
      update: {},
      create: {
        name: 'Полиграфическая продукция',
        description: 'Печатная продукция любых форматов',
        isActive: true
      }
    }),
    prisma.productGroup.upsert({
      where: { name: 'Сувенирная продукция' },
      update: {},
      create: {
        name: 'Сувенирная продукция',
        description: 'Брендированные сувениры и подарки',
        isActive: true
      }
    }),
    prisma.productGroup.upsert({
      where: { name: 'Цифровые услуги' },
      update: {},
      create: {
        name: 'Цифровые услуги',
        description: 'Дизайн, проектирование и согласование',
        isActive: true
      }
    }),
  ]);

  console.log(`✅ Создано ${productGroups.length} основных групп товаров`);

  // Функция-помощник для создания подгруппы
  const createSubgroup = (groupId, name, description) => {
    return prisma.productSubgroup.upsert({
      where: {
        groupId_name: {
          groupId: groupId,
          name: name
        }
      },
      update: {},
      create: {
        name: name,
        description: description,
        groupId: groupId,
        isActive: true
      }
    });
  };

  // Создаем подгруппы для каждой основной группы
  const naruzhkaSubgroups = await Promise.all([
    createSubgroup(
      productGroups[0].id,
      'Вывески',
      'Фасадные и крышные вывески'
    ),
    createSubgroup(
      productGroups[0].id,
      'Баннеры и растяжки',
      'Баннеры на фасадах и перетяжки'
    ),
    createSubgroup(
      productGroups[0].id,
      'Световые короба',
      'Лайтбоксы с внутренней подсветкой'
    ),
    createSubgroup(
      productGroups[0].id,
      'Стелы и пилоны',
      'Отдельностоящие рекламные конструкции'
    ),
    createSubgroup(
      productGroups[0].id,
      'Крышные установки',
      'Рекламные конструкции на крышах'
    ),
  ]);

  const interierSubgroups = await Promise.all([
    createSubgroup(
      productGroups[1].id,
      'Таблички и вывески',
      'Информационные таблички и вывески'
    ),
    createSubgroup(
      productGroups[1].id,
      'Держатели для табличек',
      'Системы крепления табличек'
    ),
    createSubgroup(
      productGroups[1].id,
      'Номерки',
      'Номерки для гардероба, ключей и т.д.'
    ),
    createSubgroup(
      productGroups[1].id,
      'Бейджи',
      'Бейджи для сотрудников'
    ),
    createSubgroup(
      productGroups[1].id,
      'Дипломы и сертификаты',
      'Наградные дипломы и сертификаты'
    ),
  ]);

  const polygraphSubgroups = await Promise.all([
    createSubgroup(
      productGroups[2].id,
      'Визитки и пластиковые карты',
      'Визитные карточки и дисконтные карты'
    ),
    createSubgroup(
      productGroups[2].id,
      'Листовки и флаеры',
      'Рекламные листовки и флаеры'
    ),
    createSubgroup(
      productGroups[2].id,
      'Каталоги и брошюры',
      'Многостраничные печатные издания'
    ),
    createSubgroup(
      productGroups[2].id,
      'Плакаты и постеры',
      'Крупноформатная печатная продукция'
    ),
    createSubgroup(
      productGroups[2].id,
      'Буклеты и лифлеты',
      'Складные буклеты с различными видами фальцовки'
    ),
  ]);

  const souvenirSubgroups = await Promise.all([
    createSubgroup(
      productGroups[3].id,
      'Ручки и канцелярия',
      'Брендированные ручки и канцелярские принадлежности'
    ),
    createSubgroup(
      productGroups[3].id,
      'Текстиль',
      'Брендированная одежда и текстильные изделия'
    ),
    createSubgroup(
      productGroups[3].id,
      'Посуда и кружки',
      'Брендированная посуда и кружки'
    ),
    createSubgroup(
      productGroups[3].id,
      'Электроника',
      'Брендированные гаджеты и электроника'
    ),
    createSubgroup(
      productGroups[3].id,
      'VIP-подарки',
      'Эксклюзивные брендированные подарки'
    ),
  ]);

  const digitalSubgroups = await Promise.all([
    createSubgroup(
      productGroups[4].id,
      'Дизайн услуги',
      'Услуги графического дизайна'
    ),
    createSubgroup(
      productGroups[4].id,
      '3D-моделирование',
      'Разработка 3D-моделей и визуализаций'
    ),
    createSubgroup(
      productGroups[4].id,
      'Проектирование конструкций',
      'Проектирование сложных рекламных конструкций'
    ),
    createSubgroup(
      productGroups[4].id,
      'Согласование рекламы',
      'Услуги согласования рекламных конструкций'
    ),
    createSubgroup(
      productGroups[4].id,
      'Брендбуки и гайдлайны',
      'Разработка фирменного стиля и правил его использования'
    ),
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
  createProductGroupsFixed()
    .catch((e) => {
      console.error('❌ Ошибка создания групп товаров:', e);
      process.exit(1);
    });
}

module.exports = { createProductGroups: createProductGroupsFixed };
