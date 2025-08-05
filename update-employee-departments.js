// Получаем список отделов
const departments = {
  "Производство": "cmcs5t5gf0000uge2fd8y5a1c",
  "Сборка": "cmcs5t5gm0001uge2bnyx5h1g", 
  "Контроль качества": "cmcs5t5go0002uge22bkdqzk2",
  "Обслуживание": "cmcs5t5gp0003uge2653az2jx",
  "Упаковка": "cmcs5t5gr0004uge2dm5o23yp"
};

// Распределение сотрудников по отделам
const employeeUpdates = [
  { personnelNumber: "EMP0004", position: "Главный инженер", department: "Производство" },
  { personnelNumber: "EMP0005", position: "Технолог", department: "Производство" },
  { personnelNumber: "EMP0006", position: "Контролер качества", department: "Контроль качества" },
  { personnelNumber: "EMP0007", position: "Токарь-универсал", department: "Производство" },
  { personnelNumber: "EMP0008", position: "Начальник смены", department: "Производство" },
  { personnelNumber: "EMP0009", position: "Слесарь-сборщик", department: "Сборка" },
  { personnelNumber: "EMP0010", position: "Инженер по охране труда", department: "Обслуживание" },
  { personnelNumber: "EMP0011", position: "Фрезеровщик", department: "Производство" },
  { personnelNumber: "EMP0012", position: "Экономист", department: "Обслуживание" },
  { personnelNumber: "EMP0013", position: "Электрик", department: "Обслуживание" },
  { personnelNumber: "EMP0003", position: "Слесарь", department: "Сборка" }
];

async function updateEmployeeDepartments() {
  console.log('Начинаю обновление отделов сотрудников...\n');
  
  // Сначала получим всех сотрудников
  const response = await fetch('http://localhost:3000/api/employees');
  const result = await response.json();
  
  if (!result.success) {
    console.log('❌ Ошибка получения списка сотрудников');
    return;
  }
  
  const employees = result.data;
  
  for (let i = 0; i < employeeUpdates.length; i++) {
    const updateInfo = employeeUpdates[i];
    
    // Найдем сотрудника по табельному номеру
    const employee = employees.find(emp => emp.personnelNumber === updateInfo.personnelNumber);
    
    if (!employee) {
      console.log(`❌ Сотрудник ${updateInfo.personnelNumber} не найден`);
      continue;
    }
    
    const departmentId = departments[updateInfo.department];
    
    if (!departmentId) {
      console.log(`❌ Отдел "${updateInfo.department}" не найден`);
      continue;
    }
    
    try {
      const updateResponse = await fetch(`http://localhost:3000/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: employee.firstName,
          lastName: employee.lastName,
          middleName: employee.middleName,
          position: employee.position,
          email: employee.email,
          phone: employee.phone,
          salary: employee.hourlyRate * 160, // Конвертируем обратно в месячную зарплату
          departmentId: departmentId,
          isActive: employee.isActive,
          hireDate: employee.hireDate
        })
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log(`✅ ${i + 1}. Обновлен: ${employee.lastName} ${employee.firstName} → ${updateInfo.department}`);
      } else {
        console.log(`❌ ${i + 1}. Ошибка: ${employee.lastName} ${employee.firstName} - ${updateResult.message}`);
      }
    } catch (error) {
      console.log(`❌ ${i + 1}. Ошибка сети: ${employee.lastName} ${employee.firstName} - ${error.message}`);
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Обновление отделов завершено!');
  
  // Покажем итоговое распределение
  console.log('\n📊 Распределение по отделам:');
  const finalResponse = await fetch('http://localhost:3000/api/employees');
  const finalResult = await finalResponse.json();
  
  if (finalResult.success) {
    const departmentCounts = {};
    finalResult.data.forEach(emp => {
      const deptName = emp.department ? emp.department.name : 'Без отдела';
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    });
    
    Object.entries(departmentCounts).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} сотрудников`);
    });
  }
}

// Запускаем скрипт
updateEmployeeDepartments();
