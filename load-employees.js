const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function loadEmployees() {
  try {
    console.log('👥 Создаем отделы и сотрудников...')
    
    // Сначала создаем отделы
    const departments = [
      { 
        name: 'Производство', 
        description: 'Производственный отдел - изготовление и сборка изделий' 
      },
      { 
        name: 'Монтаж', 
        description: 'Отдел монтажа - установка и монтаж конструкций' 
      },
      { 
        name: 'Электрика', 
        description: 'Электротехнический отдел - электромонтажные работы' 
      },
      { 
        name: 'Дизайн', 
        description: 'Отдел дизайна - разработка макетов и дизайн-проектов' 
      },
      { 
        name: 'Логистика', 
        description: 'Отдел логистики - доставка и складские операции' 
      }
    ]

    console.log('🏢 Получаем отделы...')
    const createdDepartments = {}
    for (const dept of departments) {
      let department = await prisma.department.findFirst({
        where: { name: dept.name }
      })
      
      if (!department) {
        department = await prisma.department.create({
          data: dept
        })
        console.log(`✅ Создан отдел: ${dept.name}`)
      } else {
        console.log(`✅ Найден отдел: ${dept.name}`)
      }
      
      createdDepartments[dept.name] = department.id
    }

    // Теперь создаем сотрудников
    const employees = [
      // Производство
      {
        firstName: 'Алексей',
        lastName: 'Иванов', 
        middleName: 'Петрович',
        email: 'ivanov.a@company.ru',
        position: 'Слесарь-сборщик',
        hourlyRate: 750,
        hireDate: new Date('2023-01-15'),
        phone: '+7 (920) 123-45-67',
        personnelNumber: 'EMP001',
        departmentId: createdDepartments['Производство']
      },
      {
        firstName: 'Сергей',
        lastName: 'Петров', 
        middleName: 'Викторович',
        email: 'petrov.s@company.ru',
        position: 'Сварщик',
        hourlyRate: 950,
        hireDate: new Date('2022-03-10'),
        phone: '+7 (920) 234-56-78',
        personnelNumber: 'EMP002',
        departmentId: createdDepartments['Производство']
      },
      {
        firstName: 'Михаил',
        lastName: 'Сидоров',
        middleName: 'Александрович',
        email: 'sidorov.m@company.ru', 
        position: 'Токарь',
        hourlyRate: 650,
        hireDate: new Date('2023-06-20'),
        phone: '+7 (920) 345-67-89',
        personnelNumber: 'EMP003',
        departmentId: createdDepartments['Производство']
      },
      {
        firstName: 'Андрей',
        lastName: 'Козлов',
        middleName: 'Николаевич',
        email: 'kozlov.a@company.ru',
        position: 'Фрезеровщик',
        hourlyRate: 800,
        hireDate: new Date('2022-09-05'),
        phone: '+7 (920) 456-78-90',
        personnelNumber: 'EMP004',
        departmentId: createdDepartments['Производство']
      },
      
      // Монтаж
      {
        firstName: 'Дмитрий',
        lastName: 'Морозов',
        middleName: 'Игоревич',
        email: 'morozov.d@company.ru',
        position: 'Монтажник конструкций',
        hourlyRate: 850,
        hireDate: new Date('2022-11-12'),
        phone: '+7 (920) 567-89-01',
        personnelNumber: 'EMP005',
        departmentId: createdDepartments['Монтаж']
      },
      {
        firstName: 'Евгений',
        lastName: 'Волков',
        middleName: 'Сергеевич',
        email: 'volkov.e@company.ru',
        position: 'Монтажник-высотник',
        hourlyRate: 1200,
        hireDate: new Date('2021-07-18'),
        phone: '+7 (920) 678-90-12',
        personnelNumber: 'EMP006',
        departmentId: createdDepartments['Монтаж']
      },
      {
        firstName: 'Олег',
        lastName: 'Новиков',
        middleName: 'Владимирович',
        email: 'novikov.o@company.ru',
        position: 'Крановщик',
        hourlyRate: 1100,
        hireDate: new Date('2020-04-25'),
        phone: '+7 (920) 789-01-23',
        personnelNumber: 'EMP007',
        departmentId: createdDepartments['Монтаж']
      },
      
      // Электрика
      {
        firstName: 'Игорь',
        lastName: 'Лебедев',
        middleName: 'Анатольевич',
        email: 'lebedev.i@company.ru',
        position: 'Электромонтажник',
        hourlyRate: 900,
        hireDate: new Date('2022-02-14'),
        phone: '+7 (920) 890-12-34',
        personnelNumber: 'EMP008',
        departmentId: createdDepartments['Электрика']
      },
      {
        firstName: 'Роман',
        lastName: 'Семенов',
        middleName: 'Дмитриевич',
        email: 'semenov.r@company.ru',
        position: 'Электрик',
        hourlyRate: 700,
        hireDate: new Date('2023-08-01'),
        phone: '+7 (920) 901-23-45',
        personnelNumber: 'EMP009',
        departmentId: createdDepartments['Электрика']
      },
      {
        firstName: 'Владислав',
        lastName: 'Федоров',
        middleName: 'Петрович',
        email: 'fedorov.v@company.ru',
        position: 'Инженер-электрик',
        hourlyRate: 1300,
        hireDate: new Date('2021-12-03'),
        phone: '+7 (920) 012-34-56',
        personnelNumber: 'EMP010',
        departmentId: createdDepartments['Электрика']
      },
      
      // Дизайн
      {
        firstName: 'Анна',
        lastName: 'Кузнецова',
        middleName: 'Владимировна',
        email: 'kuznetsova.a@company.ru',
        position: 'Графический дизайнер',
        hourlyRate: 800,
        hireDate: new Date('2022-05-16'),
        phone: '+7 (920) 123-45-67',
        personnelNumber: 'EMP011',
        departmentId: createdDepartments['Дизайн']
      },
      {
        firstName: 'Елена',
        lastName: 'Попова',
        middleName: 'Сергеевна',
        email: 'popova.e@company.ru',
        position: 'Дизайнер-конструктор',
        hourlyRate: 1100,
        hireDate: new Date('2021-09-22'),
        phone: '+7 (920) 234-56-78',
        personnelNumber: 'EMP012',
        departmentId: createdDepartments['Дизайн']
      },
      {
        firstName: 'Артем',
        lastName: 'Васильев',
        middleName: 'Максимович',
        email: 'vasiliev.a@company.ru',
        position: '3D-дизайнер',
        hourlyRate: 950,
        hireDate: new Date('2023-01-30'),
        phone: '+7 (920) 345-67-89',
        personnelNumber: 'EMP013',
        departmentId: createdDepartments['Дизайн']
      },
      
      // Логистика
      {
        firstName: 'Максим',
        lastName: 'Орлов',
        middleName: 'Андреевич',
        email: 'orlov.m@company.ru',
        position: 'Водитель-экспедитор',
        hourlyRate: 600,
        hireDate: new Date('2023-04-10'),
        phone: '+7 (920) 456-78-90',
        personnelNumber: 'EMP014',
        departmentId: createdDepartments['Логистика']
      },
      {
        firstName: 'Валерий',
        lastName: 'Тихонов',
        middleName: 'Олегович',
        email: 'tikhonov.v@company.ru',
        position: 'Кладовщик',
        hourlyRate: 550,
        hireDate: new Date('2022-12-01'),
        phone: '+7 (920) 567-89-01',
        personnelNumber: 'EMP015',
        departmentId: createdDepartments['Логистика']
      },
      {
        firstName: 'Николай',
        lastName: 'Зайцев',
        middleName: 'Викторович',
        email: 'zaitsev.n@company.ru',
        position: 'Логист',
        hourlyRate: 750,
        hireDate: new Date('2022-08-15'),
        phone: '+7 (920) 678-90-12',
        personnelNumber: 'EMP016',
        departmentId: createdDepartments['Логистика']
      }
    ]

    console.log('👥 Создаем сотрудников...')
    let createdCount = 0
    for (const employee of employees) {
      const createdEmployee = await prisma.employee.create({
        data: {
          ...employee,
          isActive: true
        }
      })
      createdCount++
      console.log(`✅ Создан сотрудник: ${employee.firstName} ${employee.lastName} - ${employee.position}`)
    }

    console.log(`🎉 Создано ${departments.length} отделов и ${createdCount} сотрудников!`)
    
  } catch (error) {
    console.error('❌ Ошибка при создании сотрудников:', error)
  } finally {
    await prisma.$disconnect()
  }
}

loadEmployees()
