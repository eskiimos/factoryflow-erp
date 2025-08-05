const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingWorkTypes() {
  console.log('🔧 Создание видов работ для рекламного производства...');

  // Сначала создаем отделы
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Дизайн-студия',
        description: 'Разработка макетов и дизайна',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Печатный цех',
        description: 'Широкоформатная и цифровая печать',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Постпечатная обработка',
        description: 'Резка, ламинирование, биговка',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Производственный цех',
        description: 'Изготовление конструкций и изделий',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Монтажная бригада',
        description: 'Установка и монтаж рекламных конструкций',
        isActive: true
      }
    })
  ]);

  // Создаем виды работ
  const workTypes = [
    // Дизайн-студия
    {
      name: 'Разработка логотипа',
      description: 'Создание уникального логотипа с концепцией',
      unit: 'час',
      standardTime: 8.0,
      hourlyRate: 1500.00,
      skillLevel: 'Высокий',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: 'Дизайн баннера простой',
      description: 'Создание простого баннера без сложных элементов',
      unit: 'час',
      standardTime: 2.0,
      hourlyRate: 800.00,
      skillLevel: 'Средний',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: 'Дизайн баннера сложный',
      description: 'Создание баннера с множественными элементами',
      unit: 'час',
      standardTime: 5.0,
      hourlyRate: 1200.00,
      skillLevel: 'Высокий',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: 'Дизайн визитки',
      description: 'Разработка дизайна визитной карточки',
      unit: 'час',
      standardTime: 1.5,
      hourlyRate: 600.00,
      skillLevel: 'Низкий',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: 'Верстка каталога',
      description: 'Верстка многостраничного каталога',
      unit: 'час',
      standardTime: 4.0,
      hourlyRate: 900.00,
      skillLevel: 'Средний',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: 'Ретушь фотографий',
      description: 'Обработка и ретушь фотоматериалов',
      unit: 'час',
      standardTime: 2.5,
      hourlyRate: 700.00,
      skillLevel: 'Средний',
      departmentId: departments[0].id,
      isActive: true
    },
    {
      name: '3D-моделирование',
      description: 'Создание 3D-макетов конструкций',
      unit: 'час',
      standardTime: 6.0,
      hourlyRate: 2000.00,
      skillLevel: 'Высокий',
      departmentId: departments[0].id,
      isActive: true
    },

    // Печатный цех
    {
      name: 'Широкоформатная печать',
      description: 'Печать на баннерной ткани и пленке',
      unit: 'м²',
      standardTime: 0.1,
      hourlyRate: 450.00,
      skillLevel: 'Средний',
      departmentId: departments[1].id,
      isActive: true
    },
    {
      name: 'Сольвентная печать',
      description: 'Печать сольвентными чернилами',
      unit: 'м²',
      standardTime: 0.15,
      hourlyRate: 520.00,
      skillLevel: 'Средний',
      departmentId: departments[1].id,
      isActive: true
    },
    {
      name: 'УФ-печать',
      description: 'УФ-печать на жестких материалах',
      unit: 'м²',
      standardTime: 0.2,
      hourlyRate: 650.00,
      skillLevel: 'Высокий',
      departmentId: departments[1].id,
      isActive: true
    },
    {
      name: 'Печать на холсте',
      description: 'Художественная печать на холсте',
      unit: 'м²',
      standardTime: 0.12,
      hourlyRate: 580.00,
      skillLevel: 'Средний',
      departmentId: departments[1].id,
      isActive: true
    },
    {
      name: 'Цифровая печать А3',
      description: 'Цифровая печать малых форматов',
      unit: 'лист',
      standardTime: 0.02,
      hourlyRate: 350.00,
      skillLevel: 'Низкий',
      departmentId: departments[1].id,
      isActive: true
    },
    {
      name: 'Плоттерная резка',
      description: 'Резка виниловых пленок на плоттере',
      unit: 'пог.м',
      standardTime: 0.05,
      hourlyRate: 380.00,
      skillLevel: 'Средний',
      departmentId: departments[1].id,
      isActive: true
    },

    // Постпечатная обработка
    {
      name: 'Ламинирование',
      description: 'Защитное ламинирование печатных изделий',
      hourlyRate: 320.00,
      departmentId: departments[2].id,
      isActive: true
    },
    {
      name: 'Резка гильотиной',
      description: 'Точная резка бумажных изделий',
      hourlyRate: 280.00,
      departmentId: departments[2].id,
      isActive: true
    },
    {
      name: 'Биговка и фальцовка',
      description: 'Создание сгибов и складок',
      hourlyRate: 300.00,
      departmentId: departments[2].id,
      isActive: true
    },
    {
      name: 'Установка люверсов',
      description: 'Установка металлических люверсов',
      hourlyRate: 250.00,
      departmentId: departments[2].id,
      isActive: true
    },
    {
      name: 'Сварка баннеров',
      description: 'Сварка швов баннерных материалов',
      hourlyRate: 350.00,
      departmentId: departments[2].id,
      isActive: true
    },
    {
      name: 'Склейка встык',
      description: 'Склейка материалов встык с обработкой шва',
      hourlyRate: 400.00,
      departmentId: departments[2].id,
      isActive: true
    },

    // Производственный цех
    {
      name: 'Фрезеровка ЧПУ',
      description: 'Фрезерная обработка на станке ЧПУ',
      hourlyRate: 850.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Лазерная резка',
      description: 'Лазерная резка акрила и тонких материалов',
      hourlyRate: 950.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Гибка металла',
      description: 'Гибка листового металла на станке',
      hourlyRate: 650.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Сварка металлоконструкций',
      description: 'Сварка каркасов и металлических элементов',
      hourlyRate: 750.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Покраска изделий',
      description: 'Окраска готовых изделий и конструкций',
      hourlyRate: 420.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Сборка конструкций',
      description: 'Сборка готовых рекламных конструкций',
      hourlyRate: 480.00,
      departmentId: departments[3].id,
      isActive: true
    },
    {
      name: 'Полировка акрила',
      description: 'Полировка торцов акриловых изделий',
      hourlyRate: 550.00,
      departmentId: departments[3].id,
      isActive: true
    },

    // Монтажная бригада
    {
      name: 'Монтаж наружной рекламы',
      description: 'Установка вывесок и баннеров на фасадах',
      hourlyRate: 800.00,
      departmentId: departments[4].id,
      isActive: true
    },
    {
      name: 'Монтаж интерьерной рекламы',
      description: 'Установка рекламы внутри помещений',
      hourlyRate: 600.00,
      departmentId: departments[4].id,
      isActive: true
    },
    {
      name: 'Высотные работы',
      description: 'Монтаж на высоте с использованием автовышки',
      hourlyRate: 1200.00,
      departmentId: departments[4].id,
      isActive: true
    },
    {
      name: 'Демонтаж конструкций',
      description: 'Демонтаж старых рекламных конструкций',
      hourlyRate: 500.00,
      departmentId: departments[4].id,
      isActive: true
    },
    {
      name: 'Электромонтажные работы',
      description: 'Подключение LED-подсветки и электрики',
      hourlyRate: 900.00,
      departmentId: departments[4].id,
      isActive: true
    },
    {
      name: 'Согласование в администрации',
      description: 'Оформление документов и согласований',
      hourlyRate: 700.00,
      departmentId: departments[4].id,
      isActive: true
    }
  ];

  // Создаем все виды работ
  const createdWorkTypes = await Promise.all(
    workTypes.map(workType => 
      prisma.workType.create({ data: workType })
    )
  );

  console.log(`✅ Создано ${createdWorkTypes.length} видов работ для рекламного производства`);
  console.log(`🏢 Отделы: ${departments.length}`);

  await prisma.$disconnect();
}

createAdvertisingWorkTypes()
  .catch((e) => {
    console.error('❌ Ошибка создания видов работ:', e);
    process.exit(1);
  });
