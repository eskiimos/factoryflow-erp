const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEmployeesForFurniture() {
  console.log('🏭 Добавление сотрудников для мебельного производства...');

  try {
    // Сначала получаем отделы
    let departments = await prisma.department.findMany();
    
    // Если отделов нет, создаем их
    if (departments.length === 0) {
      console.log('📋 Создание отделов...');
      
      const departmentData = [
        {
          name: 'Производственный цех',
          description: 'Основное производство мебели'
        },
        {
          name: 'Столярный цех',
          description: 'Обработка древесины и ДСП'
        },
        {
          name: 'Сборочный цех',
          description: 'Сборка готовых изделий'
        },
        {
          name: 'Отдел качества',
          description: 'Контроль качества продукции'
        },
        {
          name: 'Склад',
          description: 'Управление материалами и готовой продукцией'
        }
      ];

      for (const dept of departmentData) {
        await prisma.department.create({
          data: dept
        });
      }
      
      departments = await prisma.department.findMany();
      console.log(`✅ Создано ${departments.length} отделов`);
    }

    // Функция для генерации персонального номера
    const generatePersonnelNumber = () => {
      return Math.floor(1000 + Math.random() * 9000).toString();
    };

    // Данные сотрудников для мебельного производства
    const employeesData = [
      // Производственный цех
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Александр',
        lastName: 'Петров',
        middleName: 'Иванович',
        position: 'Мастер производства',
        skillLevel: 'Эксперт',
        hourlyRate: 850,
        currency: 'RUB',
        hireDate: new Date('2020-03-15'),
        phone: '+7 (999) 123-45-67',
        email: 'a.petrov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Михаил',
        lastName: 'Сидоров',
        middleName: 'Петрович',
        position: 'Станочник ЧПУ',
        skillLevel: 'Специалист',
        hourlyRate: 750,
        currency: 'RUB',
        hireDate: new Date('2021-06-10'),
        phone: '+7 (999) 234-56-78',
        email: 'm.sidorov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Дмитрий',
        lastName: 'Козлов',
        middleName: 'Александрович',
        position: 'Оператор раскроя',
        skillLevel: 'Рабочий',
        hourlyRate: 600,
        currency: 'RUB',
        hireDate: new Date('2022-01-20'),
        phone: '+7 (999) 345-67-89',
        email: 'd.kozlov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      },

      // Столярный цех
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Владимир',
        lastName: 'Кузнецов',
        middleName: 'Николаевич',
        position: 'Столяр-краснодеревщик',
        skillLevel: 'Эксперт',
        hourlyRate: 900,
        currency: 'RUB',
        hireDate: new Date('2018-09-05'),
        phone: '+7 (999) 456-78-90',
        email: 'v.kuznetsov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Андрей',
        lastName: 'Волков',
        middleName: 'Сергеевич',
        position: 'Столяр',
        skillLevel: 'Специалист',
        hourlyRate: 700,
        currency: 'RUB',
        hireDate: new Date('2020-11-12'),
        phone: '+7 (999) 567-89-01',
        email: 'a.volkov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Сергей',
        lastName: 'Морозов',
        middleName: 'Викторович',
        position: 'Шлифовщик',
        skillLevel: 'Рабочий',
        hourlyRate: 550,
        currency: 'RUB',
        hireDate: new Date('2023-04-08'),
        phone: '+7 (999) 678-90-12',
        email: 's.morozov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id
      },

      // Сборочный цех
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Роман',
        lastName: 'Новиков',
        middleName: 'Андреевич',
        position: 'Мастер сборки',
        skillLevel: 'Специалист',
        hourlyRate: 750,
        currency: 'RUB',
        hireDate: new Date('2019-07-22'),
        phone: '+7 (999) 789-01-23',
        email: 'r.novikov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Игорь',
        lastName: 'Федоров',
        middleName: 'Дмитриевич',
        position: 'Сборщик мебели',
        skillLevel: 'Рабочий',
        hourlyRate: 650,
        currency: 'RUB',
        hireDate: new Date('2021-12-03'),
        phone: '+7 (999) 890-12-34',
        email: 'i.fedorov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Павел',
        lastName: 'Соколов',
        middleName: 'Михайлович',
        position: 'Монтажник фурнитуры',
        skillLevel: 'Рабочий',
        hourlyRate: 600,
        currency: 'RUB',
        hireDate: new Date('2022-08-15'),
        phone: '+7 (999) 901-23-45',
        email: 'p.sokolov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Алексей',
        lastName: 'Лебедев',
        middleName: 'Владимирович',
        position: 'Упаковщик',
        skillLevel: 'Стажер',
        hourlyRate: 450,
        currency: 'RUB',
        hireDate: new Date('2024-02-10'),
        phone: '+7 (999) 012-34-56',
        email: 'a.lebedev@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id
      },

      // Отдел качества
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Елена',
        lastName: 'Попова',
        middleName: 'Александровна',
        position: 'Контролер ОТК',
        skillLevel: 'Специалист',
        hourlyRate: 700,
        currency: 'RUB',
        hireDate: new Date('2020-05-18'),
        phone: '+7 (999) 123-45-01',
        email: 'e.popova@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Отдел качества')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Ольга',
        lastName: 'Васильева',
        middleName: 'Петровна',
        position: 'Инспектор качества',
        skillLevel: 'Специалист',
        hourlyRate: 650,
        currency: 'RUB',
        hireDate: new Date('2021-10-25'),
        phone: '+7 (999) 234-56-02',
        email: 'o.vasileva@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Отдел качества')?.id
      },

      // Склад
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Виктор',
        lastName: 'Орлов',
        middleName: 'Геннадьевич',
        position: 'Заведующий складом',
        skillLevel: 'Специалист',
        hourlyRate: 750,
        currency: 'RUB',
        hireDate: new Date('2019-01-14'),
        phone: '+7 (999) 345-67-03',
        email: 'v.orlov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Склад')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Максим',
        lastName: 'Ильин',
        middleName: 'Валерьевич',
        position: 'Кладовщик',
        skillLevel: 'Рабочий',
        hourlyRate: 500,
        currency: 'RUB',
        hireDate: new Date('2022-03-07'),
        phone: '+7 (999) 456-78-04',
        email: 'm.ilin@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Склад')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Николай',
        lastName: 'Зайцев',
        middleName: 'Игоревич',
        position: 'Грузчик',
        skillLevel: 'Стажер',
        hourlyRate: 400,
        currency: 'RUB',
        hireDate: new Date('2024-01-15'),
        phone: '+7 (999) 567-89-05',
        email: 'n.zaitsev@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Склад')?.id
      },

      // Дополнительные специалисты
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Анна',
        lastName: 'Крылова',
        middleName: 'Сергеевна',
        position: 'Дизайнер мебели',
        skillLevel: 'Специалист',
        hourlyRate: 800,
        currency: 'RUB',
        hireDate: new Date('2020-09-30'),
        phone: '+7 (999) 678-90-06',
        email: 'a.krylova@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Татьяна',
        lastName: 'Макарова',
        middleName: 'Владимировна',
        position: 'Технолог',
        skillLevel: 'Эксперт',
        hourlyRate: 950,
        currency: 'RUB',
        hireDate: new Date('2017-11-08'),
        phone: '+7 (999) 789-01-07',
        email: 't.makarova@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      },
      {
        personnelNumber: generatePersonnelNumber(),
        firstName: 'Иван',
        lastName: 'Богданов',
        middleName: 'Алексеевич',
        position: 'Наладчик оборудования',
        skillLevel: 'Специалист',
        hourlyRate: 800,
        currency: 'RUB',
        hireDate: new Date('2019-04-16'),
        phone: '+7 (999) 890-12-08',
        email: 'i.bogdanov@factory.ru',
        status: 'ACTIVE',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id
      }
    ];

    // Добавляем сотрудников
    console.log(`👥 Добавление ${employeesData.length} сотрудников...`);
    
    for (const employee of employeesData) {
      await prisma.employee.create({
        data: employee
      });
      console.log(`✅ Добавлен: ${employee.firstName} ${employee.lastName} - ${employee.position}`);
    }

    console.log(`\n🎉 Успешно добавлено ${employeesData.length} сотрудников!`);
    
    // Статистика по отделам
    console.log('\n📊 Статистика по отделам:');
    for (const dept of departments) {
      const count = employeesData.filter(emp => emp.departmentId === dept.id).length;
      console.log(`   ${dept.name}: ${count} сотрудников`);
    }

    // Статистика по уровням квалификации
    const skillStats = employeesData.reduce((acc, emp) => {
      acc[emp.skillLevel] = (acc[emp.skillLevel] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🎓 Статистика по квалификации:');
    Object.entries(skillStats).forEach(([skill, count]) => {
      console.log(`   ${skill}: ${count} человек`);
    });

    // Статистика по зарплатам
    const rates = employeesData.map(emp => emp.hourlyRate);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    console.log(`\n💰 Средняя ставка: ${avgRate.toFixed(0)} руб/час`);
    console.log(`   Минимальная: ${Math.min(...rates)} руб/час`);
    console.log(`   Максимальная: ${Math.max(...rates)} руб/час`);

  } catch (error) {
    console.error('❌ Ошибка при добавлении сотрудников:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmployeesForFurniture();
