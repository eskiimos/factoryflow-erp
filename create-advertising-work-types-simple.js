const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdvertisingWorkTypesSimple() {
  console.log('🔧 Создание видов работ для рекламного производства...');

  // Получаем существующие отделы или создаем новые
  let departments;
  try {
    departments = await prisma.department.findMany({
      where: {
        isActive: true
      }
    });
    
    if (departments.length === 0) {
      // Создаем отделы если их нет
      departments = await Promise.all([
        prisma.department.upsert({
          where: { name: 'Дизайн-студия' },
          update: {},
          create: {
            name: 'Дизайн-студия',
            description: 'Разработка макетов и дизайна',
            isActive: true
          }
        }),
        prisma.department.upsert({
          where: { name: 'Печатный цех' },
          update: {},
          create: {
            name: 'Печатный цех',
            description: 'Широкоформатная и цифровая печать',
            isActive: true
          }
        }),
        prisma.department.upsert({
          where: { name: 'Постпечатная обработка' },
          update: {},
          create: {
            name: 'Постпечатная обработка',
            description: 'Резка, ламинирование, биговка',
            isActive: true
          }
        }),
        prisma.department.upsert({
          where: { name: 'Производственный цех' },
          update: {},
          create: {
            name: 'Производственный цех',
            description: 'Изготовление конструкций и изделий',
            isActive: true
          }
        }),
        prisma.department.upsert({
          where: { name: 'Монтажная бригада' },
          update: {},
          create: {
            name: 'Монтажная бригада',
            description: 'Установка и монтаж рекламных конструкций',
            isActive: true
          }
        })
      ]);
    }
  } catch (error) {
    console.log('Используем существующие отделы...');
    departments = await prisma.department.findMany({
      where: { isActive: true }
    });
  }

  console.log(`📋 Найдено отделов: ${departments.length}`);

  // Создаем виды работ с полными данными
  const workTypes = [
    // Дизайн-студия
    {
      name: 'Разработка логотипа',
      description: 'Создание уникального логотипа с концепцией',
      unit: 'час',
      standardTime: 8.0,
      hourlyRate: 1500.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Дизайн'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Дизайн баннера простой',
      description: 'Создание простого баннера без сложных элементов',
      unit: 'час',
      standardTime: 2.0,
      hourlyRate: 800.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Дизайн'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Дизайн баннера сложный',
      description: 'Создание баннера с множественными элементами',
      unit: 'час',
      standardTime: 5.0,
      hourlyRate: 1200.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Дизайн'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Дизайн визитки',
      description: 'Разработка дизайна визитной карточки',
      unit: 'час',
      standardTime: 1.5,
      hourlyRate: 600.00,
      skillLevel: 'Низкий',
      departmentId: departments.find(d => d.name.includes('Дизайн'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Верстка каталога',
      description: 'Верстка многостраничного каталога',
      unit: 'час',
      standardTime: 4.0,
      hourlyRate: 900.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Дизайн'))?.id || departments[0]?.id,
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
      departmentId: departments.find(d => d.name.includes('Печатный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Сольвентная печать',
      description: 'Печать сольвентными чернилами',
      unit: 'м²',
      standardTime: 0.15,
      hourlyRate: 520.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Печатный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'УФ-печать',
      description: 'УФ-печать на жестких материалах',
      unit: 'м²',
      standardTime: 0.2,
      hourlyRate: 650.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Печатный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Плоттерная резка',
      description: 'Резка виниловых пленок на плоттере',
      unit: 'пог.м',
      standardTime: 0.05,
      hourlyRate: 380.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Печатный'))?.id || departments[0]?.id,
      isActive: true
    },

    // Постпечатная обработка
    {
      name: 'Ламинирование',
      description: 'Защитное ламинирование печатных изделий',
      unit: 'м²',
      standardTime: 0.08,
      hourlyRate: 320.00,
      skillLevel: 'Низкий',
      departmentId: departments.find(d => d.name.includes('Постпечатная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Резка гильотиной',
      description: 'Точная резка бумажных изделий',
      unit: 'рез',
      standardTime: 0.05,
      hourlyRate: 280.00,
      skillLevel: 'Низкий',
      departmentId: departments.find(d => d.name.includes('Постпечатная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Установка люверсов',
      description: 'Установка металлических люверсов',
      unit: 'шт',
      standardTime: 0.02,
      hourlyRate: 250.00,
      skillLevel: 'Низкий',
      departmentId: departments.find(d => d.name.includes('Постпечатная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Сварка баннеров',
      description: 'Сварка швов баннерных материалов',
      unit: 'пог.м',
      standardTime: 0.1,
      hourlyRate: 350.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Постпечатная'))?.id || departments[0]?.id,
      isActive: true
    },

    // Производственный цех
    {
      name: 'Фрезеровка ЧПУ',
      description: 'Фрезерная обработка на станке ЧПУ',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 850.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Производственный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Лазерная резка',
      description: 'Лазерная резка акрила и тонких материалов',
      unit: 'пог.м',
      standardTime: 0.1,
      hourlyRate: 950.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Производственный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Сварка металлоконструкций',
      description: 'Сварка каркасов и металлических элементов',
      unit: 'шов',
      standardTime: 0.3,
      hourlyRate: 750.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Производственный'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Покраска изделий',
      description: 'Окраска готовых изделий и конструкций',
      unit: 'м²',
      standardTime: 0.25,
      hourlyRate: 420.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Производственный'))?.id || departments[0]?.id,
      isActive: true
    },

    // Монтажная бригада
    {
      name: 'Монтаж наружной рекламы',
      description: 'Установка вывесок и баннеров на фасадах',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 800.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Монтажная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Монтаж интерьерной рекламы',
      description: 'Установка рекламы внутри помещений',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 600.00,
      skillLevel: 'Средний',
      departmentId: departments.find(d => d.name.includes('Монтажная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Высотные работы',
      description: 'Монтаж на высоте с использованием автовышки',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 1200.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Монтажная'))?.id || departments[0]?.id,
      isActive: true
    },
    {
      name: 'Электромонтажные работы',
      description: 'Подключение LED-подсветки и электрики',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 900.00,
      skillLevel: 'Высокий',
      departmentId: departments.find(d => d.name.includes('Монтажная'))?.id || departments[0]?.id,
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

  await prisma.$disconnect();
}

createAdvertisingWorkTypesSimple()
  .catch((e) => {
    console.error('❌ Ошибка создания видов работ:', e);
    process.exit(1);
  });
