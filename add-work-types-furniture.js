const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addWorkTypesForFurniture() {
  console.log('🔨 Добавление видов работ для мебельного производства...');

  try {
    // Получаем отделы
    const departments = await prisma.department.findMany();
    
    // Виды работ для мебельного производства
    const workTypesData = [
      // Производственный цех
      {
        name: 'Проектирование мебели',
        description: 'Создание чертежей и 3D-моделей мебели',
        unit: 'час',
        standardTime: 4.0,
        hourlyRate: 800,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Компьютер с CAD-системой',
        safetyRequirements: 'Работа за компьютером',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 1.0,
        timePerUnit: 4.0
      },
      {
        name: 'Раскрой листовых материалов',
        description: 'Раскрой ДСП, МДФ на форматно-раскроечном станке',
        unit: 'м²',
        standardTime: 0.5,
        hourlyRate: 600,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Форматно-раскроечный станок',
        safetyRequirements: 'Защитные очки, перчатки',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id,
        calculationUnit: 'час/м²',
        productivityRate: 2.0,
        timePerUnit: 0.5
      },
      {
        name: 'Обработка кромки',
        description: 'Наклейка кромочной ленты на детали',
        unit: 'м.п.',
        standardTime: 0.2,
        hourlyRate: 550,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Кромкооблицовочный станок',
        safetyRequirements: 'Защитные перчатки',
        departmentId: departments.find(d => d.name === 'Производственный цех')?.id,
        calculationUnit: 'час/м.п.',
        productivityRate: 5.0,
        timePerUnit: 0.2
      },

      // Столярный цех
      {
        name: 'Фрезеровка деталей',
        description: 'Обработка деталей на фрезерном станке',
        unit: 'шт',
        standardTime: 0.3,
        hourlyRate: 700,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Фрезерный станок ЧПУ',
        safetyRequirements: 'Защитные очки, наушники',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id,
        calculationUnit: 'час/шт',
        productivityRate: 3.0,
        timePerUnit: 0.3
      },
      {
        name: 'Сверление отверстий',
        description: 'Сверление отверстий под фурнитуру',
        unit: 'шт',
        standardTime: 0.1,
        hourlyRate: 500,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Присадочный станок',
        safetyRequirements: 'Защитные очки',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id,
        calculationUnit: 'час/шт',
        productivityRate: 10.0,
        timePerUnit: 0.1
      },
      {
        name: 'Шлифовка поверхностей',
        description: 'Шлифовка деталей перед покраской',
        unit: 'м²',
        standardTime: 0.8,
        hourlyRate: 550,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Шлифовальная машинка',
        safetyRequirements: 'Респиратор, защитные очки',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id,
        calculationUnit: 'час/м²',
        productivityRate: 1.25,
        timePerUnit: 0.8
      },
      {
        name: 'Покраска деталей',
        description: 'Нанесение лакокрасочных покрытий',
        unit: 'м²',
        standardTime: 1.0,
        hourlyRate: 650,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Покрасочная камера',
        safetyRequirements: 'Респиратор, защитная одежда',
        departmentId: departments.find(d => d.name === 'Столярный цех')?.id,
        calculationUnit: 'час/м²',
        productivityRate: 1.0,
        timePerUnit: 1.0
      },

      // Сборочный цех
      {
        name: 'Предварительная сборка',
        description: 'Сборка деталей в узлы',
        unit: 'шт',
        standardTime: 1.5,
        hourlyRate: 650,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Верстак, инструменты',
        safetyRequirements: 'Рабочие перчатки',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 0.67,
        timePerUnit: 1.5
      },
      {
        name: 'Установка фурнитуры',
        description: 'Монтаж петель, ручек, направляющих',
        unit: 'комплект',
        standardTime: 0.5,
        hourlyRate: 600,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Шуруповерт, отвертки',
        safetyRequirements: 'Защитные очки',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id,
        calculationUnit: 'час/комплект',
        productivityRate: 2.0,
        timePerUnit: 0.5
      },
      {
        name: 'Финальная сборка',
        description: 'Окончательная сборка изделия',
        unit: 'изделие',
        standardTime: 3.0,
        hourlyRate: 750,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Верстак, полный набор инструментов',
        safetyRequirements: 'Рабочие перчатки',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 0.33,
        timePerUnit: 3.0
      },
      {
        name: 'Регулировка фурнитуры',
        description: 'Настройка дверей, ящиков, механизмов',
        unit: 'изделие',
        standardTime: 1.0,
        hourlyRate: 700,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Набор ключей, отверток',
        safetyRequirements: 'Аккуратность при работе',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 1.0,
        timePerUnit: 1.0
      },
      {
        name: 'Упаковка изделий',
        description: 'Упаковка готовой мебели для транспортировки',
        unit: 'изделие',
        standardTime: 0.5,
        hourlyRate: 450,
        currency: 'RUB',
        skillLevel: 'Стажер',
        equipmentRequired: 'Упаковочные материалы',
        safetyRequirements: 'Аккуратное обращение с изделием',
        departmentId: departments.find(d => d.name === 'Сборочный цех')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 2.0,
        timePerUnit: 0.5
      },

      // Отдел качества
      {
        name: 'Входной контроль материалов',
        description: 'Проверка качества поступающих материалов',
        unit: 'партия',
        standardTime: 1.0,
        hourlyRate: 700,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Измерительные инструменты',
        safetyRequirements: 'Внимательность',
        departmentId: departments.find(d => d.name === 'Отдел качества')?.id,
        calculationUnit: 'час/партия',
        productivityRate: 1.0,
        timePerUnit: 1.0
      },
      {
        name: 'Контроль готовых изделий',
        description: 'Финальная проверка качества мебели',
        unit: 'изделие',
        standardTime: 0.5,
        hourlyRate: 650,
        currency: 'RUB',
        skillLevel: 'Специалист',
        equipmentRequired: 'Контрольные образцы',
        safetyRequirements: 'Тщательный осмотр',
        departmentId: departments.find(d => d.name === 'Отдел качества')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 2.0,
        timePerUnit: 0.5
      },

      // Склад
      {
        name: 'Приемка материалов',
        description: 'Прием и размещение материалов на складе',
        unit: 'тонна',
        standardTime: 0.5,
        hourlyRate: 500,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Погрузчик, весы',
        safetyRequirements: 'Спецодежда, каска',
        departmentId: departments.find(d => d.name === 'Склад')?.id,
        calculationUnit: 'час/тонна',
        productivityRate: 2.0,
        timePerUnit: 0.5
      },
      {
        name: 'Отгрузка готовой продукции',
        description: 'Подготовка и отгрузка готовых изделий',
        unit: 'изделие',
        standardTime: 0.3,
        hourlyRate: 450,
        currency: 'RUB',
        skillLevel: 'Рабочий',
        equipmentRequired: 'Погрузочная техника',
        safetyRequirements: 'Спецодежда, осторожность',
        departmentId: departments.find(d => d.name === 'Склад')?.id,
        calculationUnit: 'час/изделие',
        productivityRate: 3.33,
        timePerUnit: 0.3
      }
    ];

    // Добавляем виды работ
    console.log(`🔧 Добавление ${workTypesData.length} видов работ...`);
    
    for (const workType of workTypesData) {
      await prisma.workType.create({
        data: workType
      });
      console.log(`✅ Добавлен: ${workType.name} (${workType.hourlyRate} руб/час)`);
    }

    console.log(`\n🎉 Успешно добавлено ${workTypesData.length} видов работ!`);
    
    // Статистика по отделам
    console.log('\n📊 Статистика по отделам:');
    for (const dept of departments) {
      const count = workTypesData.filter(wt => wt.departmentId === dept.id).length;
      console.log(`   ${dept.name}: ${count} видов работ`);
    }

    // Статистика по уровням квалификации
    const skillStats = workTypesData.reduce((acc, wt) => {
      acc[wt.skillLevel] = (acc[wt.skillLevel] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n🎓 Статистика по требуемой квалификации:');
    Object.entries(skillStats).forEach(([skill, count]) => {
      console.log(`   ${skill}: ${count} видов работ`);
    });

    // Статистика по ставкам
    const rates = workTypesData.map(wt => wt.hourlyRate);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    console.log(`\n💰 Средняя ставка: ${avgRate.toFixed(0)} руб/час`);
    console.log(`   Минимальная: ${Math.min(...rates)} руб/час`);
    console.log(`   Максимальная: ${Math.max(...rates)} руб/час`);

  } catch (error) {
    console.error('❌ Ошибка при добавлении видов работ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addWorkTypesForFurniture();
