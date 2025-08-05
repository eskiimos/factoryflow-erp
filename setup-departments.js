const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDepartments() {
  try {
    console.log('👥 Проверяем отделы...\n');

    // Получаем все отделы
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    if (departments.length === 0) {
      console.log('❗ Отделы не найдены. Создаем основные отделы...');
      
      // Создаем базовые отделы для рекламного производства
      const departmentsToCreate = [
        { name: 'Руководство', description: 'Руководящий состав компании' },
        { name: 'Дизайн', description: 'Отдел дизайна и подготовки макетов' },
        { name: 'Производство', description: 'Производственный отдел' },
        { name: 'Монтаж', description: 'Отдел монтажа и установки' },
        { name: 'Продажи', description: 'Отдел продаж и работы с клиентами' },
        { name: 'Финансы', description: 'Финансовый отдел и бухгалтерия' },
        { name: 'Снабжение', description: 'Отдел снабжения и логистики' },
        { name: 'Персонал', description: 'Отдел кадров и HR' }
      ];

      for (const dept of departmentsToCreate) {
        await prisma.department.create({
          data: dept
        });
        console.log(`✅ Создан отдел: ${dept.name}`);
      }

      // Получаем созданные отделы
      const createdDepartments = await prisma.department.findMany();
      console.log(`\n🎉 Создано ${createdDepartments.length} отделов`);
    } else {
      console.log(`📋 Найдено ${departments.length} отделов:`);
      
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} - сотрудников: ${dept._count.employees}`);
        console.log(`   Описание: ${dept.description || 'не указано'}`);
      });
    }

    console.log('\n📝 Назначаем сотрудников в соответствующие отделы...');

    // Получаем все отделы
    const allDepartments = await prisma.department.findMany();
    const departmentMap = {};
    
    allDepartments.forEach(dept => {
      departmentMap[dept.name] = dept.id;
    });

    // Соответствие сотрудников и отделов
    const employeeToDepartment = [
      { personnelNumber: 'DIR-001', departmentName: 'Руководство' },
      { personnelNumber: 'DSN-001', departmentName: 'Дизайн' },
      { personnelNumber: 'PRN-001', departmentName: 'Производство' },
      { personnelNumber: 'SAL-001', departmentName: 'Продажи' },
      { personnelNumber: 'INS-001', departmentName: 'Монтаж' },
      { personnelNumber: 'FIN-001', departmentName: 'Финансы' },
      { personnelNumber: 'PRD-002', departmentName: 'Производство' },
      { personnelNumber: 'SUP-001', departmentName: 'Снабжение' },
      { personnelNumber: 'QC-001', departmentName: 'Производство' },
      { personnelNumber: 'HR-001', departmentName: 'Персонал' }
    ];

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

checkDepartments();
