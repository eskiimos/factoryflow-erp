const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEmployeesAndDepartments() {
  console.log('Добавляем отделы и сотрудников для мебельного производства...');

  // Создаем отделы
  const departments = [
    {
      name: 'Цех распила',
      description: 'Раскрой ЛДСП, МДФ, обработка кромки'
    },
    {
      name: 'Сборочный цех',
      description: 'Сборка корпусной мебели'
    },
    {
      name: 'Столярный цех',
      description: 'Изготовление деревянных элементов'
    },
    {
      name: 'Цех фурнитуры',
      description: 'Установка направляющих, петель, фурнитуры'
    },
    {
      name: 'Отдел контроля качества',
      description: 'Проверка качества готовой продукции'
    }
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    try {
      const department = await prisma.department.create({
        data: dept
      });
      createdDepartments.push(department);
      console.log(`✓ Создан отдел: ${dept.name}`);
    } catch (error) {
      console.log(`- Отдел уже существует: ${dept.name}`);
      const existing = await prisma.department.findFirst({
        where: { name: dept.name }
      });
      if (existing) createdDepartments.push(existing);
    }
  }

  // Создаем сотрудников
  const employees = [
    // Цех распила
    {
      personnelNumber: 'EMP001',
      firstName: 'Андрей',
      lastName: 'Столяров',
      middleName: 'Петрович',
      position: 'Оператор форматно-раскроечного станка',
      skillLevel: 'Специалист',
      hourlyRate: 800,
      departmentId: createdDepartments[0]?.id
    },
    {
      personnelNumber: 'EMP002',
      firstName: 'Михаил',
      lastName: 'Пильщиков',
      middleName: 'Александрович',
      position: 'Оператор кромкооблицовочного станка',
      skillLevel: 'Эксперт',
      hourlyRate: 900,
      departmentId: createdDepartments[0]?.id
    },
    {
      personnelNumber: 'EMP003',
      firstName: 'Денис',
      lastName: 'Раскройщиков',
      middleName: 'Сергеевич',
      position: 'Помощник оператора',
      skillLevel: 'Рабочий',
      hourlyRate: 600,
      departmentId: createdDepartments[0]?.id
    },
    
    // Сборочный цех
    {
      personnelNumber: 'EMP004',
      firstName: 'Владимир',
      lastName: 'Мебельщиков',
      middleName: 'Иванович',
      position: 'Мастер-сборщик мебели',
      skillLevel: 'Эксперт',
      hourlyRate: 950,
      departmentId: createdDepartments[1]?.id
    },
    {
      personnelNumber: 'EMP005',
      firstName: 'Сергей',
      lastName: 'Крепежов',
      middleName: 'Николаевич',
      position: 'Сборщик корпусной мебели',
      skillLevel: 'Специалист',
      hourlyRate: 750,
      departmentId: createdDepartments[1]?.id
    },
    {
      personnelNumber: 'EMP006',
      firstName: 'Алексей',
      lastName: 'Монтажников',
      middleName: 'Владимирович',
      position: 'Сборщик мебели',
      skillLevel: 'Рабочий',
      hourlyRate: 650,
      departmentId: createdDepartments[1]?.id
    },
    
    // Столярный цех
    {
      personnelNumber: 'EMP007',
      firstName: 'Николай',
      lastName: 'Деревянкин',
      middleName: 'Федорович',
      position: 'Столяр-краснодеревщик',
      skillLevel: 'Эксперт',
      hourlyRate: 1100,
      departmentId: createdDepartments[2]?.id
    },
    {
      personnelNumber: 'EMP008',
      firstName: 'Павел',
      lastName: 'Шлифовальщиков',
      middleName: 'Геннадьевич',
      position: 'Столяр-отделочник',
      skillLevel: 'Специалист',
      hourlyRate: 850,
      departmentId: createdDepartments[2]?.id
    },
    
    // Цех фурнитуры
    {
      personnelNumber: 'EMP009',
      firstName: 'Дмитрий',
      lastName: 'Фурнитуров',
      middleName: 'Олегович',
      position: 'Установщик фурнитуры',
      skillLevel: 'Специалист',
      hourlyRate: 780,
      departmentId: createdDepartments[3]?.id
    },
    {
      personnelNumber: 'EMP010',
      firstName: 'Игорь',
      lastName: 'Направляющих',
      middleName: 'Анатольевич',
      position: 'Монтажник направляющих',
      skillLevel: 'Рабочий',
      hourlyRate: 650,
      departmentId: createdDepartments[3]?.id
    },
    
    // Контроль качества
    {
      personnelNumber: 'EMP011',
      firstName: 'Елена',
      lastName: 'Контролева',
      middleName: 'Викторовна',
      position: 'Мастер ОТК',
      skillLevel: 'Эксперт',
      hourlyRate: 900,
      departmentId: createdDepartments[4]?.id
    },
    
    // Универсальные специалисты
    {
      personnelNumber: 'EMP012',
      firstName: 'Александр',
      lastName: 'Универсалов',
      middleName: 'Сергеевич',
      position: 'Мастер-универсал',
      skillLevel: 'Эксперт',
      hourlyRate: 1000,
      departmentId: createdDepartments[1]?.id
    },
    {
      personnelNumber: 'EMP013',
      firstName: 'Виталий',
      lastName: 'Помощников',
      middleName: 'Андреевич',
      position: 'Подсобный рабочий',
      skillLevel: 'Стажер',
      hourlyRate: 500,
      departmentId: createdDepartments[1]?.id
    },
    {
      personnelNumber: 'EMP014',
      firstName: 'Роман',
      lastName: 'Упаковщиков',
      middleName: 'Максимович',
      position: 'Упаковщик готовой продукции',
      skillLevel: 'Рабочий',
      hourlyRate: 550,
      departmentId: createdDepartments[4]?.id
    },
    {
      personnelNumber: 'EMP015',
      firstName: 'Евгений',
      lastName: 'Доставкин',
      middleName: 'Юрьевич',
      position: 'Водитель-экспедитор',
      skillLevel: 'Рабочий',
      hourlyRate: 700,
      departmentId: createdDepartments[4]?.id
    }
  ];

  let addedCount = 0;
  for (const emp of employees) {
    try {
      const employee = await prisma.employee.create({
        data: {
          ...emp,
          hireDate: new Date(),
          status: 'ACTIVE'
        }
      });
      console.log(`✓ Добавлен сотрудник: ${emp.lastName} ${emp.firstName} - ${emp.position}`);
      addedCount++;
    } catch (error) {
      console.log(`- Сотрудник уже существует: ${emp.lastName} ${emp.firstName}`);
    }
  }

  console.log(`\n📊 Итого добавлено:`);
  console.log(`   Отделы: ${createdDepartments.length}`);
  console.log(`   Сотрудники: ${addedCount}`);
}

addEmployeesAndDepartments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
