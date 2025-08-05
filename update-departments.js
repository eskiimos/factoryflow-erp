const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDepartments() {
  try {
    console.log('👥 Обновляем отделы для рекламного производства...\n');

    // Получаем все существующие отделы
    const existingDepartments = await prisma.department.findMany();
    console.log(`📋 Найдено ${existingDepartments.length} существующих отделов`);

    // Маппинг для соответствия названий
    const departmentMapping = {
      'Руководство': 'Руководство компании',
      'Дизайн': 'Дизайн-студия',
      'Производство': 'Производственный цех',
      'Монтаж': 'Монтажная бригада',
      'Продажи': 'Отдел продаж',
      'Финансы': 'Финансовый отдел',
      'Снабжение': 'Отдел снабжения',
      'Персонал': 'HR-отдел',
      'Постпечатная обработка': 'Постпечатная обработка',
      'Печатный цех': 'Печатный цех'
    };

    // Обновляем существующие отделы
    for (const dept of existingDepartments) {
      console.log(`⚙️ Обработка отдела: ${dept.name}`);
    }

    // Создаем недостающие отделы
    const neededDepartments = [
      { name: 'Руководство компании', description: 'Руководящий состав компании' },
      { name: 'Отдел продаж', description: 'Отдел продаж и работы с клиентами' },
      { name: 'Финансовый отдел', description: 'Финансовый отдел и бухгалтерия' },
      { name: 'Отдел снабжения', description: 'Отдел снабжения и логистики' },
      { name: 'HR-отдел', description: 'Отдел кадров и HR' }
    ];

    // Проверяем каких отделов не хватает
    const existingNames = existingDepartments.map(d => d.name);
    const departmentsToCreate = neededDepartments.filter(d => !existingNames.includes(d.name));

    console.log(`\n📝 Создаем ${departmentsToCreate.length} недостающих отделов...`);
    
    for (const dept of departmentsToCreate) {
      await prisma.department.create({
        data: dept
      });
      console.log(`✅ Создан отдел: ${dept.name}`);
    }

    // Получаем обновленный список отделов
    const allDepartments = await prisma.department.findMany();
    console.log(`\n📋 Теперь в системе ${allDepartments.length} отделов`);

    // Создаем карту соответствия отделов
    const departmentMap = {};
    allDepartments.forEach(dept => {
      departmentMap[dept.name] = dept.id;
    });

    // Соответствие сотрудников и отделов
    const employeeToDepartment = [
      { personnelNumber: 'DIR-001', departmentName: 'Руководство компании' },
      { personnelNumber: 'DSN-001', departmentName: 'Дизайн-студия' },
      { personnelNumber: 'PRN-001', departmentName: 'Печатный цех' },
      { personnelNumber: 'SAL-001', departmentName: 'Отдел продаж' },
      { personnelNumber: 'INS-001', departmentName: 'Монтажная бригада' },
      { personnelNumber: 'FIN-001', departmentName: 'Финансовый отдел' },
      { personnelNumber: 'PRD-002', departmentName: 'Постпечатная обработка' },
      { personnelNumber: 'SUP-001', departmentName: 'Отдел снабжения' },
      { personnelNumber: 'QC-001', departmentName: 'Производственный цех' },
      { personnelNumber: 'HR-001', departmentName: 'HR-отдел' }
    ];

    console.log('\n📝 Назначаем сотрудников в соответствующие отделы...');

    // Обновляем сотрудников, назначая их в соответствующие отделы
    for (const mapping of employeeToDepartment) {
      const departmentId = departmentMap[mapping.departmentName];
      
      if (!departmentId) {
        console.log(`❌ Не найден отдел: ${mapping.departmentName}`);
        continue;
      }

      await prisma.employee.update({
        where: { personnelNumber: mapping.personnelNumber },
        data: { departmentId }
      });

      console.log(`✅ Сотрудник ${mapping.personnelNumber} назначен в отдел "${mapping.departmentName}"`);
    }

    // Получаем обновленную статистику по отделам
    const updatedDepartments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        },
        employees: true
      }
    });

    console.log('\n📊 Обновленная статистика по отделам:');
    updatedDepartments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} - сотрудников: ${dept._count.employees}`);
      
      if (dept._count.employees > 0) {
        console.log('   Сотрудники:');
        dept.employees.forEach(emp => {
          console.log(`   - ${emp.lastName} ${emp.firstName} (${emp.position})`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Ошибка при работе с отделами:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDepartments();
