const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingFundsFixed() {
  console.log('💰 Создание фондов для рекламного производства...');

  // Создаем фонды напрямую (без категорий, так как они больше не используются в Fund)
  const funds = [
    // Накладные расходы
    {
      name: 'Содержание оборудования',
      description: 'Амортизация, ремонт и обслуживание производственного оборудования',
      fundType: 'OVERHEAD',
      totalAmount: 450000.00,
      isActive: true
    },
    {
      name: 'Энергозатраты производства',
      description: 'Электроэнергия для производственного оборудования',
      fundType: 'OVERHEAD',
      totalAmount: 180000.00,
      isActive: true
    },
    {
      name: 'Содержание производственных помещений',
      description: 'Аренда, отопление, уборка производственных площадей',
      fundType: 'OVERHEAD',
      totalAmount: 280000.00,
      isActive: true
    },
    {
      name: 'Инструмент и оснастка',
      description: 'Приобретение и обслуживание производственного инструмента',
      fundType: 'OVERHEAD',
      totalAmount: 120000.00,
      isActive: true
    },
    {
      name: 'Контроль качества',
      description: 'Расходы на контроль качества продукции',
      fundType: 'OVERHEAD',
      totalAmount: 65000.00,
      isActive: true
    },

    // Административные расходы
    {
      name: 'Заработная плата АУП',
      description: 'Зарплата административно-управленческого персонала',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 850000.00,
      isActive: true
    },
    {
      name: 'Содержание офиса',
      description: 'Аренда, коммунальные услуги, уборка офисных помещений',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 220000.00,
      isActive: true
    },
    {
      name: 'Связь и интернет',
      description: 'Телефония, интернет, мобильная связь',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 45000.00,
      isActive: true
    },
    {
      name: 'Офисные расходы',
      description: 'Канцелярия, расходные материалы для офиса',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 35000.00,
      isActive: true
    },
    {
      name: 'Программное обеспечение',
      description: 'Лицензии на ПО, подписки на сервисы',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 180000.00,
      isActive: true
    },
    {
      name: 'Юридические услуги',
      description: 'Консультации юристов, оформление документов',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 85000.00,
      isActive: true
    },
    {
      name: 'Бухгалтерские услуги',
      description: 'Ведение учета, налоговое планирование',
      fundType: 'ADMINISTRATIVE',
      totalAmount: 120000.00,
      isActive: true
    },

    // Коммерческие расходы
    {
      name: 'Реклама и маркетинг',
      description: 'Расходы на продвижение и рекламу услуг',
      fundType: 'COMMERCIAL',
      totalAmount: 350000.00,
      isActive: true
    },
    {
      name: 'Транспортные расходы',
      description: 'Доставка материалов и готовой продукции',
      fundType: 'COMMERCIAL',
      totalAmount: 180000.00,
      isActive: true
    },
    {
      name: 'Командировочные расходы',
      description: 'Поездки менеджеров к клиентам, участие в выставках',
      fundType: 'COMMERCIAL',
      totalAmount: 95000.00,
      isActive: true
    },
    {
      name: 'Представительские расходы',
      description: 'Расходы на деловые встречи с клиентами',
      fundType: 'COMMERCIAL',
      totalAmount: 75000.00,
      isActive: true
    },
    {
      name: 'Упаковка и комплектация',
      description: 'Материалы для упаковки готовой продукции',
      fundType: 'COMMERCIAL',
      totalAmount: 45000.00,
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

  await prisma.$disconnect();
}

createAdvertisingFundsFixed()
  .catch((e) => {
    console.error('❌ Ошибка создания фондов:', e);
    process.exit(1);
  });
