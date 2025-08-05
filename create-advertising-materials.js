const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingMaterials() {
  console.log('🎨 Создание материалов для рекламного производства...');

  // Сначала создаем категории для материалов
  const materialCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Носители печати',
        description: 'Материалы для печати рекламных изделий',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Пленки и покрытия',
        description: 'Виниловые пленки, ламинаты и защитные покрытия',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Жесткие материалы',
        description: 'Пластик, металл, дерево для конструкций',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Комплектующие',
        description: 'Крепеж, профили, фурнитура',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Расходные материалы',
        description: 'Краски, клеи, растворители',
        isActive: true
      }
    })
  ]);

  // Создаем материалы
  const materials = [
    // Носители печати
    {
      name: 'Баннерная ткань 440г/м²',
      unit: 'м²',
      price: 185.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Баннерная ткань 510г/м²',
      unit: 'м²',
      price: 220.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Сетка баннерная 270г/м²',
      unit: 'м²',
      price: 165.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Холст художественный',
      unit: 'м²',
      price: 280.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Бумага для плоттера А1',
      unit: 'лист',
      price: 15.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Фотобумага матовая А3',
      unit: 'лист',
      price: 28.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },
    {
      name: 'Самоклеящаяся бумага белая',
      unit: 'м²',
      price: 95.00,
      currency: 'RUB',
      categoryId: materialCategories[0].id,
      isActive: true
    },

    // Пленки и покрытия
    {
      name: 'Виниловая пленка белая глянец',
      unit: 'м²',
      price: 320.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Виниловая пленка белая матовая',
      unit: 'м²',
      price: 340.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Виниловая пленка прозрачная',
      unit: 'м²',
      price: 380.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Пленка односторонного обзора',
      unit: 'м²',
      price: 450.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Ламинирующая пленка глянец',
      unit: 'м²',
      price: 85.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Ламинирующая пленка матовая',
      unit: 'м²',
      price: 90.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },
    {
      name: 'Антивандальная пленка',
      unit: 'м²',
      price: 520.00,
      currency: 'RUB',
      categoryId: materialCategories[1].id,
      isActive: true
    },

    // Жесткие материалы
    {
      name: 'ПВХ 3мм белый',
      unit: 'м²',
      price: 680.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'ПВХ 5мм белый',
      unit: 'м²',
      price: 950.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'ПВХ 10мм белый',
      unit: 'м²',
      price: 1450.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Композит 3мм белый',
      unit: 'м²',
      price: 1250.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Композит 4мм белый',
      unit: 'м²',
      price: 1580.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Акрил 3мм прозрачный',
      unit: 'м²',
      price: 2100.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Акрил 5мм прозрачный',
      unit: 'м²',
      price: 3200.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Оцинкованная сталь 0.5мм',
      unit: 'м²',
      price: 450.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Алюминиевый лист 1мм',
      unit: 'м²',
      price: 850.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },
    {
      name: 'Фанера 10мм березовая',
      unit: 'м²',
      price: 980.00,
      currency: 'RUB',
      categoryId: materialCategories[2].id,
      isActive: true
    },

    // Комплектующие
    {
      name: 'Алюминиевый профиль 20x20мм',
      unit: 'пог.м',
      price: 125.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Алюминиевый профиль 30x30мм',
      unit: 'пог.м',
      price: 185.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Соединитель угловой 20мм',
      unit: 'шт',
      price: 15.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Соединитель угловой 30мм',
      unit: 'шт',
      price: 22.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Саморез 4x16мм',
      unit: 'шт',
      price: 2.50,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Дюбель 6x40мм',
      unit: 'шт',
      price: 3.20,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Магниты неодимовые 10мм',
      unit: 'шт',
      price: 25.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Петли рояльные 30мм',
      unit: 'пог.м',
      price: 145.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Цепочка для баннера',
      unit: 'пог.м',
      price: 35.00,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },
    {
      name: 'Люверсы медные 8мм',
      unit: 'шт',
      price: 4.50,
      currency: 'RUB',
      categoryId: materialCategories[3].id,
      isActive: true
    },

    // Расходные материалы
    {
      name: 'Клей 88 универсальный',
      unit: 'л',
      price: 280.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Двусторонний скотч 3М',
      unit: 'пог.м',
      price: 12.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Монтажная пена',
      unit: 'баллон',
      price: 185.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Силиконовый герметик',
      unit: 'туба',
      price: 120.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Растворитель 646',
      unit: 'л',
      price: 85.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Краска акриловая белая',
      unit: 'кг',
      price: 320.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Краска акриловая черная',
      unit: 'кг',
      price: 340.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    },
    {
      name: 'Лак защитный матовый',
      unit: 'л',
      price: 450.00,
      currency: 'RUB',
      categoryId: materialCategories[4].id,
      isActive: true
    }
  ];

  // Создаем все материалы
  const createdMaterials = await Promise.all(
    materials.map(material => 
      prisma.materialItem.create({ data: material })
    )
  );

  console.log(`✅ Создано ${createdMaterials.length} материалов для рекламного производства`);
  console.log(`📁 Категории материалов: ${materialCategories.length}`);

  await prisma.$disconnect();
}

createAdvertisingMaterials()
  .catch((e) => {
    console.error('❌ Ошибка создания материалов:', e);
    process.exit(1);
  });
