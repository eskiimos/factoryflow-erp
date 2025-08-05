const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedFunds() {
  console.log('🌱 Seeding funds data...')

  // Создаем фонды
  const fundsSalesData = {
    name: 'Фонд отдела продаж',
    description: 'Фонд для покрытия расходов отдела продаж и мотивации сотрудников',
    fundType: 'SALES',
    totalAmount: 5000000,
    allocatedAmount: 0,
    remainingAmount: 5000000,
    status: 'ACTIVE',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isActive: true
  }

  const fundsProductionData = {
    name: 'Фонд производства',
    description: 'Фонд для обеспечения производственной деятельности и развития',
    fundType: 'PRODUCTION',
    totalAmount: 8500000,
    allocatedAmount: 0,
    remainingAmount: 8500000,
    status: 'ACTIVE',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    isActive: true
  }

  // Создаем фонд продаж
  const salesFund = await prisma.fund.create({
    data: {
      ...fundsSalesData,
      categories: {
        create: [
          {
            name: 'Фонд отдела продаж',
            categoryType: 'EXPENSE',
            plannedAmount: 663000,
            actualAmount: 0,
            percentage: 13.26,
            description: 'Расходы на отдел продаж',
            priority: 1,
            items: {
              create: [
                {
                  name: 'Петров С.Р. менеджер',
                  itemType: 'SALARY',
                  amount: 33000,
                  currency: 'RUB',
                  description: 'Зарплата менеджера',
                  isRecurring: true,
                  priority: 1
                },
                {
                  name: 'Исламова М. менеджер',
                  itemType: 'SALARY',
                  amount: 60000,
                  currency: 'RUB',
                  description: 'Зарплата менеджера',
                  isRecurring: true,
                  priority: 2
                },
                {
                  name: 'Мохнева Р. менеджер',
                  itemType: 'SALARY',
                  amount: 91000,
                  currency: 'RUB',
                  description: 'Зарплата менеджера',
                  isRecurring: true,
                  priority: 3
                },
                {
                  name: 'Цыбульская А. менеджер',
                  itemType: 'SALARY',
                  amount: 79000,
                  currency: 'RUB',
                  description: 'Зарплата менеджера',
                  isRecurring: true,
                  priority: 4
                },
                {
                  name: 'Битюк М. офис-менеджер',
                  itemType: 'SALARY',
                  amount: 60000,
                  currency: 'RUB',
                  description: 'Зарплата офис-менеджера',
                  isRecurring: true,
                  priority: 5
                }
              ]
            }
          },
          {
            name: 'Фонд производства',
            categoryType: 'EXPENSE',
            plannedAmount: 1093800,
            actualAmount: 0,
            percentage: 21.88,
            description: 'Расходы на производство',
            priority: 2,
            items: {
              create: [
                {
                  name: 'Литвинов НПО/монтажник',
                  itemType: 'SALARY',
                  amount: 74000,
                  currency: 'RUB',
                  description: 'Зарплата НПО/монтажника',
                  isRecurring: true,
                  priority: 1
                },
                {
                  name: 'Буша Кладовщик-закупщик',
                  itemType: 'SALARY',
                  amount: 40000,
                  currency: 'RUB',
                  description: 'Зарплата кладовщика-закупщика',
                  isRecurring: true,
                  priority: 2
                },
                {
                  name: 'Горбунов Водит-монтажник',
                  itemType: 'SALARY',
                  amount: 79300,
                  currency: 'RUB',
                  description: 'Зарплата водителя-монтажника',
                  isRecurring: true,
                  priority: 3
                },
                {
                  name: 'Толобаев слесарь-монтажник',
                  itemType: 'SALARY',
                  amount: 69000,
                  currency: 'RUB',
                  description: 'Зарплата слесаря-монтажника',
                  isRecurring: true,
                  priority: 4
                }
              ]
            }
          }
        ]
      }
    }
  })

  // Создаем фонд производства
  const productionFund = await prisma.fund.create({
    data: {
      ...fundsProductionData,
      categories: {
        create: [
          {
            name: 'Фонд сырья',
            categoryType: 'EXPENSE',
            plannedAmount: 850000,
            actualAmount: 0,
            percentage: 17.0,
            description: 'Расходы на сырье и материалы',
            priority: 1,
            items: {
              create: [
                {
                  name: 'Сырьё на базе',
                  itemType: 'EXPENSE',
                  amount: 850000,
                  currency: 'RUB',
                  description: 'Закупка сырья и материалов',
                  isRecurring: false,
                  priority: 1
                }
              ]
            }
          },
          {
            name: 'Налоги',
            categoryType: 'EXPENSE',
            plannedAmount: 8000,
            actualAmount: 0,
            percentage: 8.0,
            description: 'Налоговые расходы',
            priority: 2,
            items: {
              create: [
                {
                  name: 'НДС',
                  itemType: 'OTHER',
                  amount: 8000,
                  currency: 'RUB',
                  description: 'Налог на добавленную стоимость',
                  isRecurring: true,
                  priority: 1
                }
              ]
            }
          },
          {
            name: 'Постоянные расходы',
            categoryType: 'EXPENSE',
            plannedAmount: 369450,
            actualAmount: 0,
            percentage: 7.39,
            description: 'Постоянные операционные расходы',
            priority: 3,
            items: {
              create: [
                {
                  name: 'Аренда офиса',
                  itemType: 'EXPENSE',
                  amount: 88000,
                  currency: 'RUB',
                  description: 'Аренда офисного помещения',
                  isRecurring: true,
                  priority: 1
                },
                {
                  name: 'Аренда производства',
                  itemType: 'EXPENSE',
                  amount: 88000,
                  currency: 'RUB',
                  description: 'Аренда производственного помещения',
                  isRecurring: true,
                  priority: 2
                },
                {
                  name: 'Телефония',
                  itemType: 'EXPENSE',
                  amount: 10000,
                  currency: 'RUB',
                  description: 'Телефонная связь',
                  isRecurring: true,
                  priority: 3
                },
                {
                  name: 'Интернет',
                  itemType: 'EXPENSE',
                  amount: 10000,
                  currency: 'RUB',
                  description: 'Интернет соединение',
                  isRecurring: true,
                  priority: 4
                },
                {
                  name: 'Офисные расходы',
                  itemType: 'EXPENSE',
                  amount: 7000,
                  currency: 'RUB',
                  description: 'Канцелярия и офисные принадлежности',
                  isRecurring: true,
                  priority: 5
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log(`✅ Created ${2} funds with categories and items`)

  // Создаем транзакции для тестирования
  await prisma.fundTransaction.createMany({
    data: [
      {
        fundId: salesFund.id,
        transactionType: 'INCOME',
        amount: 5000000,
        currency: 'RUB',
        description: 'Первоначальное пополнение фонда продаж',
        status: 'COMPLETED',
        transactionDate: new Date('2025-01-01')
      },
      {
        fundId: productionFund.id,
        transactionType: 'INCOME',
        amount: 8500000,
        currency: 'RUB',
        description: 'Первоначальное пополнение фонда производства',
        status: 'COMPLETED',
        transactionDate: new Date('2025-01-01')
      },
      {
        fundId: salesFund.id,
        transactionType: 'EXPENSE',
        amount: 33000,
        currency: 'RUB',
        description: 'Выплата зарплаты Петрову С.Р.',
        status: 'COMPLETED',
        transactionDate: new Date('2025-07-01')
      }
    ]
  })

  console.log(`✅ Created sample fund transactions`)
}

// Запускаем функцию если этот файл выполняется напрямую
if (require.main === module) {
  seedFunds()
    .catch((e) => {
      console.error('❌ Error seeding funds:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

module.exports = { seedFunds }
