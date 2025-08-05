const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recreateWorkTypes() {
  try {
    console.log('🗑️ Удаляем все существующие виды работ...');
    
    // Удаляем все виды работ
    const deletedCount = await prisma.workType.deleteMany({});
    console.log(`✅ Удалено ${deletedCount.count} видов работ`);

    console.log('🏢 Получаем отделы...');
    
    // Получаем отделы
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          where: { isActive: true }
        }
      }
    });

    console.log(`✅ Найдено ${departments.length} отделов`);

    // Функция для поиска отдела по названию
    const findDepartment = (name) => {
      return departments.find(dept => 
        dept.name.toLowerCase().includes(name.toLowerCase())
      );
    };

    // Данные новых видов работ
    const workTypes = [
      {
        name: "Проклейка светодиодной ленты",
        description: "Проклейка светодиодной ленты на конструкции",
        group: "Сборочные операции",
        cost: 5.00,
        unit: "пог. м.",
        departmentName: "Производство"
      },
      {
        name: "Соединения проводов коммутация 1 узла шт 220 Вольт",
        description: "Соединение и коммутация проводов 220В",
        group: "Сборочные операции", 
        cost: 30.00,
        unit: "шт",
        departmentName: "Электрика"
      },
      {
        name: "Фрезеровка АКП",
        description: "Фрезеровочные работы по алюмокомпозитным панелям",
        group: "Фрезеровка",
        cost: 15.00,
        unit: "пог. м.",
        departmentName: "Производство"
      },
      {
        name: "Фрезеровка Акрила 2-4 мм",
        description: "Фрезеровка акриловых панелей толщиной 2-4 мм",
        group: "Фрезеровка",
        cost: 10.00,
        unit: "пог. м.",
        departmentName: "Производство"
      },
      {
        name: "Фрезеровка ПВХ 2-6 мм",
        description: "Фрезеровка ПВХ панелей толщиной 2-6 мм",
        group: "Фрезеровка",
        cost: 7.00,
        unit: "пог. м.",
        departmentName: "Производство"
      },
      {
        name: "Сборка элементов с засечками и акриловым бортом за см",
        description: "Сборка элементов с засечками и установка акрилового борта",
        group: "Сборочные операции",
        cost: 100.00,
        unit: "пог. м.",
        departmentName: "Производство"
      },
      {
        name: "Раскидка задников на (каркасе, композите..) раскидать и закрепить шт в см",
        description: "Раскладка и крепление задников на каркасе или композите",
        group: "Сборочные операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Монтаж"
      },
      {
        name: "Подготовка файла на фрезеровку (лицо, борта, задники) и согласование",
        description: "Подготовка файлов для фрезеровки и согласование проекта",
        group: "Дизайнерские операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Дизайн"
      },
      {
        name: "Подготовка плёнки под вывеску на плоттерную резку и согласование",
        description: "Подготовка плёнки для плоттерной резки и согласование",
        group: "Дизайнерские операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Дизайн"
      },
      {
        name: "Подготовка шаблона под раскидку светодиодов и согласование",
        description: "Подготовка шаблона для раскладки светодиодов и согласование",
        group: "Дизайнерские операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Дизайн"
      },
      {
        name: "Подготовка чертежей под крепления и инструкции по монтажу и согласование",
        description: "Подготовка чертежей крепежных элементов и инструкций по монтажу",
        group: "Дизайнерские операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Дизайн"
      },
      {
        name: "Подготовка инструкции под сборку всей конструкции и согласование",
        description: "Подготовка полной инструкции по сборке конструкции",
        group: "Дизайнерские операции",
        cost: 340.00,
        unit: "ч",
        departmentName: "Дизайн"
      }
    ];

    console.log('🛠️ Создаем новые виды работ...');
    
    let createdCount = 0;
    for (const workTypeData of workTypes) {
      const department = findDepartment(workTypeData.departmentName);
      
      if (!department) {
        console.log(`⚠️ Отдел "${workTypeData.departmentName}" не найден для работы "${workTypeData.name}"`);
        continue;
      }

      // Выбираем первого активного сотрудника из отдела
      const assignedEmployee = department.employees.length > 0 ? department.employees[0] : null;

      const workType = await prisma.workType.create({
        data: {
          name: workTypeData.name,
          description: workTypeData.description,
          unit: workTypeData.unit,
          standardTime: 1.0, // Стандартное время 1 час
          hourlyRate: workTypeData.cost,
          currency: "RUB",
          skillLevel: "Специалист", // Устанавливаем уровень по умолчанию
          departmentId: department.id,
          isActive: true
        }
      });

      createdCount++;
      console.log(`✅ Создан вид работы: ${workType.name} - ${workType.hourlyRate} руб/${workType.unit} (Отдел: ${department.name}${assignedEmployee ? `, Исполнитель: ${assignedEmployee.firstName} ${assignedEmployee.lastName}` : ', Исполнитель: не назначен'})`);
    }

    console.log(`🎉 Создано ${createdCount} новых видов работ!`);
    
  } catch (error) {
    console.error('❌ Ошибка при пересоздании видов работ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateWorkTypes();
