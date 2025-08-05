const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingFunds() {
  console.log('💰 Создание фондов для рекламного производства...');

  // Создаем категории для фондов
  const fundCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Накладные расходы',
        description: 'Общепроизводственные накладные расходы',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Административные расходы',
        description: 'Управленческие и административные расходы',
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        name: 'Коммерческие расходы',
        description: 'Расходы на продажи и маркетинг',
        isActive: true
      }
    })
  ]);

  // Создаем фонды
  const funds = [
    // Накладные расходы
    {
      name: 'Содержание оборудования',
      description: 'Амортизация, ремонт и обслуживание производственного оборудования',
      fundType: 'OVERHEAD',
      totalAmount: 450000.00,
      categoryId: fundCategories[0].id,
      isActive: true
    },
    {
      name: 'Энергозатраты производства',
      description: 'Электроэнергия для производственного оборудования',
      totalAmount: 180000.00,
      categoryId: fundCategories[0].id,
      isActive: true
    },
    {
      name: 'Содержание производственных помещений',
      description: 'Аренда, отопление, уборка производственных площадей',
      totalAmount: 280000.00,
      categoryId: fundCategories[0].id,
      isActive: true
    },
    {
      name: 'Инструмент и оснастка',
      description: 'Приобретение и обслуживание производственного инструмента',
      totalAmount: 120000.00,
      categoryId: fundCategories[0].id,
      isActive: true
    },
    {
      name: 'Контроль качества',
      description: 'Расходы на контроль качества продукции',
      totalAmount: 65000.00,
      categoryId: fundCategories[0].id,
      isActive: true
    },

    // Административные расходы
    {
      name: 'Заработная плата АУП',
      description: 'Зарплата административно-управленческого персонала',
      totalAmount: 850000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Содержание офиса',
      description: 'Аренда, коммунальные услуги, уборка офисных помещений',
      totalAmount: 220000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Связь и интернет',
      description: 'Телефония, интернет, мобильная связь',
      totalAmount: 45000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Офисные расходы',
      description: 'Канцелярия, расходные материалы для офиса',
      totalAmount: 35000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Программное обеспечение',
      description: 'Лицензии на ПО, подписки на сервисы',
      totalAmount: 180000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Юридические услуги',
      description: 'Консультации юристов, оформление документов',
      totalAmount: 85000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },
    {
      name: 'Бухгалтерские услуги',
      description: 'Ведение учета, налоговое планирование',
      totalAmount: 120000.00,
      categoryId: fundCategories[1].id,
      isActive: true
    },

    // Коммерческие расходы
    {
      name: 'Реклама и маркетинг',
      description: 'Расходы на продвижение и рекламу услуг',
      totalAmount: 350000.00,
      categoryId: fundCategories[2].id,
      isActive: true
    },
    {
      name: 'Транспортные расходы',
      description: 'Доставка материалов и готовой продукции',
      totalAmount: 180000.00,
      categoryId: fundCategories[2].id,
      isActive: true
    },
    {
      name: 'Командировочные расходы',
      description: 'Поездки менеджеров к клиентам, участие в выставках',
      totalAmount: 95000.00,
      categoryId: fundCategories[2].id,
      isActive: true
    },
    {
      name: 'Представительские расходы',
      description: 'Расходы на деловые встречи с клиентами',
      totalAmount: 75000.00,
      categoryId: fundCategories[2].id,
      isActive: true
    },
    {
      name: 'Упаковка и комплектация',
      description: 'Материалы для упаковки готовой продукции',
      totalAmount: 45000.00,
      categoryId: fundCategories[2].id,
      isActive: true
    }
  ];

  // Создаем все фонды
  const createdFunds = await Promise.all(
    funds.map(fund => 
      prisma.fund.create({ data: fund })
    )
  );

  console.log(`✅ Создано ${createdFunds.length} фондов для рекламного производства`);
  console.log(`📁 Категории фондов: ${fundCategories.length}`);

  await prisma.$disconnect();
}

createAdvertisingFunds()
  .catch((e) => {
    console.error('❌ Ошибка создания фондов:', e);
    process.exit(1);
  });
