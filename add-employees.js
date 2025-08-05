const employees = [
  {
    firstName: "Анна",
    lastName: "Козлова",
    middleName: "Владимировна",
    position: "Главный инженер",
    email: "anna.kozlova@factoryflow.com",
    phone: "+79161234567",
    salary: 150000,
    hireDate: "2023-03-15"
  },
  {
    firstName: "Дмитрий",
    lastName: "Смирнов",
    middleName: "Александрович",
    position: "Технолог",
    email: "dmitry.smirnov@factoryflow.com",
    phone: "+79162345678",
    salary: 120000,
    hireDate: "2023-05-20"
  },
  {
    firstName: "Елена",
    lastName: "Волкова",
    middleName: "Игоревна",
    position: "Контролер качества",
    email: "elena.volkova@factoryflow.com",
    phone: "+79163456789",
    salary: 85000,
    hireDate: "2023-08-10"
  },
  {
    firstName: "Михаил",
    lastName: "Федоров",
    middleName: "Сергеевич",
    position: "Токарь-универсал",
    email: "mikhail.fedorov@factoryflow.com",
    phone: "+79164567890",
    salary: 95000,
    hireDate: "2022-11-05"
  },
  {
    firstName: "Ольга",
    lastName: "Новикова",
    middleName: "Петровна",
    position: "Начальник смены",
    email: "olga.novikova@factoryflow.com",
    phone: "+79165678901",
    salary: 110000,
    hireDate: "2022-07-18"
  },
  {
    firstName: "Сергей",
    lastName: "Морозов",
    middleName: "Викторович",
    position: "Слесарь-сборщик",
    email: "sergey.morozov@factoryflow.com",
    phone: "+79166789012",
    salary: 75000,
    hireDate: "2024-01-22"
  },
  {
    firstName: "Татьяна",
    lastName: "Лебедева",
    middleName: "Алексеевна",
    position: "Инженер по охране труда",
    email: "tatyana.lebedeva@factoryflow.com",
    phone: "+79167890123",
    salary: 90000,
    hireDate: "2023-12-03"
  },
  {
    firstName: "Алексей",
    lastName: "Соколов",
    middleName: "Николаевич",
    position: "Фрезеровщик",
    email: "alexey.sokolov@factoryflow.com",
    phone: "+79168901234",
    salary: 88000,
    hireDate: "2024-02-14"
  },
  {
    firstName: "Мария",
    lastName: "Павлова",
    middleName: "Дмитриевна",
    position: "Экономист",
    email: "maria.pavlova@factoryflow.com",
    phone: "+79169012345",
    salary: 100000,
    hireDate: "2023-09-07"
  },
  {
    firstName: "Игорь",
    lastName: "Васильев",
    middleName: "Андреевич",
    position: "Электрик",
    email: "igor.vasiliev@factoryflow.com",
    phone: "+79160123456",
    salary: 82000,
    hireDate: "2024-06-01"
  }
];

async function addEmployees() {
  console.log('Начинаю добавление сотрудников...');
  
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${i + 1}. Добавлен: ${employee.lastName} ${employee.firstName} ${employee.middleName || ''} - ${employee.position}`);
      } else {
        console.log(`❌ ${i + 1}. Ошибка: ${employee.lastName} ${employee.firstName} - ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ ${i + 1}. Ошибка сети: ${employee.lastName} ${employee.firstName} - ${error.message}`);
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Добавление сотрудников завершено!');
}

// Запускаем скрипт
addEmployees();
