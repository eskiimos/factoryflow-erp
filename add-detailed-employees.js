const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addEmployees() {
  try {
    console.log('👥 Добавляем сотрудников с полными данными...\n');

    // Сначала очистим существующих сотрудников
    await prisma.employee.deleteMany({});
    console.log('🗑️  Очищены существующие сотрудники');

    // Подробные данные сотрудников для рекламного производства
    const employees = [
      {
        personnelNumber: 'DIR-001',
        firstName: 'Алексей',
        lastName: 'Иванов',
        middleName: 'Сергеевич',
        email: 'a.ivanov@factoryflow.ru',
        phone: '+7 (495) 123-45-67',
        position: 'Директор производства',
        skillLevel: 'Эксперт',
        hourlyRate: 750,
        currency: 'RUB',
        hireDate: new Date('2020-01-15'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'DSN-001',
        firstName: 'Мария',
        lastName: 'Петрова',
        middleName: 'Александровна',
        email: 'm.petrova@factoryflow.ru',
        phone: '+7 (495) 234-56-78',
        position: 'Главный дизайнер',
        skillLevel: 'Продвинутый',
        hourlyRate: 530,
        currency: 'RUB',
        hireDate: new Date('2021-03-10'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'PRN-001',
        firstName: 'Дмитрий',
        lastName: 'Сидоров',
        middleName: 'Владимирович',
        email: 'd.sidorov@factoryflow.ru',
        phone: '+7 (495) 345-67-89',
        position: 'Оператор печати',
        skillLevel: 'Опытный',
        hourlyRate: 375,
        currency: 'RUB',
        hireDate: new Date('2019-06-20'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'SAL-001',
        firstName: 'Елена',
        lastName: 'Козлова',
        middleName: 'Игоревна',
        email: 'e.kozlova@factoryflow.ru',
        phone: '+7 (495) 456-78-90',
        position: 'Менеджер по продажам',
        skillLevel: 'Средний',
        hourlyRate: 440,
        currency: 'RUB',
        hireDate: new Date('2022-01-12'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'INS-001',
        firstName: 'Андрей',
        lastName: 'Морозов',
        middleName: 'Николаевич',
        email: 'a.morozov@factoryflow.ru',
        phone: '+7 (495) 567-89-01',
        position: 'Монтажник',
        skillLevel: 'Опытный',
        hourlyRate: 405,
        currency: 'RUB',
        hireDate: new Date('2020-09-15'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'FIN-001',
        firstName: 'Ольга',
        lastName: 'Новикова',
        middleName: 'Викторовна',
        email: 'o.novikova@factoryflow.ru',
        phone: '+7 (495) 678-90-12',
        position: 'Бухгалтер',
        skillLevel: 'Опытный',
        hourlyRate: 470,
        currency: 'RUB',
        hireDate: new Date('2018-04-05'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'PRD-002',
        firstName: 'Павел',
        lastName: 'Волков',
        middleName: 'Андреевич',
        email: 'p.volkov@factoryflow.ru',
        phone: '+7 (495) 789-01-23',
        position: 'Постпечатная обработка',
        skillLevel: 'Начинающий',
        hourlyRate: 340,
        currency: 'RUB',
        hireDate: new Date('2021-11-08'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'SUP-001',
        firstName: 'Татьяна',
        lastName: 'Лебедева',
        middleName: 'Михайловна',
        email: 't.lebedeva@factoryflow.ru',
        phone: '+7 (495) 890-12-34',
        position: 'Снабженец',
        skillLevel: 'Средний',
        hourlyRate: 360,
        currency: 'RUB',
        hireDate: new Date('2019-08-22'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'QC-001',
        firstName: 'Игорь',
        lastName: 'Смирнов',
        middleName: 'Петрович',
        email: 'i.smirnov@factoryflow.ru',
        phone: '+7 (495) 901-23-45',
        position: 'Контролер качества',
        skillLevel: 'Опытный',
        hourlyRate: 385,
        currency: 'RUB',
        hireDate: new Date('2020-12-01'),
        status: 'ACTIVE',
      },
      {
        personnelNumber: 'HR-001',
        firstName: 'Светлана',
        lastName: 'Федорова',
        middleName: 'Валерьевна',
        email: 's.fedorova@factoryflow.ru',
        phone: '+7 (495) 012-34-56',
        position: 'HR-менеджер',
        skillLevel: 'Средний',
        hourlyRate: 425,
        currency: 'RUB',
        hireDate: new Date('2021-07-15'),
        status: 'ACTIVE',
      }
    ];

    console.log('📝 Создаем сотрудников...');
    
    for (const employee of employees) {
      const createdEmployee = await prisma.employee.create({
        data: employee
      });
      
      console.log(`✅ Создан сотрудник: ${employee.firstName} ${employee.lastName} - ${employee.position}`);
    }

    console.log(`\n🎉 Успешно добавлено ${employees.length} сотрудников с полными данными!`);
    
    // Показываем информацию о добавленных сотрудниках
    console.log('\n📋 Список добавленных сотрудников:');
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.personnelNumber}: ${employee.lastName} ${employee.firstName} - ${employee.position} (${employee.skillLevel})`);
      console.log(`   Почасовая ставка: ${employee.hourlyRate} ${employee.currency}/час`);
    });

    console.log('\n📋 Включенные данные для каждого сотрудника:');
    console.log('• Табельный номер (personnelNumber)');
    console.log('• ФИО (полностью)');
    console.log('• Контакты (email, телефон)');
    console.log('• Должность');
    console.log('• Уровень квалификации');
    console.log('• Почасовая ставка');
    console.log('• Валюта оплаты');
    console.log('• Дата приема');
    console.log('• Статус (активен/неактивен)');

  } catch (error) {
    console.error('❌ Ошибка при добавлении сотрудников:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmployees();
