const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function loadWorkTypes() {
  try {
    console.log('🛠️ Создаем типы работ...')

    // Получаем отделы
    const departments = await prisma.department.findMany()
    const deptMap = {}
    departments.forEach(dept => {
      deptMap[dept.name] = dept.id
    })

    const workTypes = [
      // Производство
      {
        name: 'Слесарная сборка',
        description: 'Сборка металлических конструкций, соединение деталей',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 750,
        productivityRate: 1.0,
        departmentId: deptMap['Производство']
      },
      {
        name: 'Сварочные работы',
        description: 'Электродуговая и полуавтоматическая сварка',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 950,
        productivityRate: 1.0,
        departmentId: deptMap['Производство']
      },
      {
        name: 'Токарные работы',
        description: 'Обработка деталей на токарном станке',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 650,
        productivityRate: 1.0,
        departmentId: deptMap['Производство']
      },
      {
        name: 'Фрезерные работы',
        description: 'Обработка деталей на фрезерном станке',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 800,
        productivityRate: 1.0,
        departmentId: deptMap['Производство']
      },
      
      // Монтаж
      {
        name: 'Монтаж конструкций',
        description: 'Установка и монтаж металлических конструкций',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 850,
        productivityRate: 1.0,
        departmentId: deptMap['Монтаж']
      },
      {
        name: 'Высотные работы',
        description: 'Монтажные работы на высоте',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 1200,
        productivityRate: 1.0,
        departmentId: deptMap['Монтаж']
      },
      {
        name: 'Крановые работы',
        description: 'Подъем и перемещение грузов краном',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 1100,
        productivityRate: 1.0,
        departmentId: deptMap['Монтаж']
      },
      
      // Электрика
      {
        name: 'Электромонтаж',
        description: 'Монтаж электрических систем и оборудования',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 900,
        productivityRate: 1.0,
        departmentId: deptMap['Электрика']
      },
      {
        name: 'Электрические работы',
        description: 'Подключение и наладка электрооборудования',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 700,
        productivityRate: 1.0,
        departmentId: deptMap['Электрика']
      },
      {
        name: 'Проектирование электрики',
        description: 'Разработка электрических схем и проектов',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 1300,
        productivityRate: 1.0,
        departmentId: deptMap['Электрика']
      },
      
      // Дизайн
      {
        name: 'Графический дизайн',
        description: 'Создание визуальных материалов и макетов',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 800,
        productivityRate: 1.0,
        departmentId: deptMap['Дизайн']
      },
      {
        name: 'Конструкторские работы',
        description: 'Разработка конструкторской документации',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 1100,
        productivityRate: 1.0,
        departmentId: deptMap['Дизайн']
      },
      {
        name: '3D-моделирование',
        description: 'Создание трехмерных моделей и визуализация',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 950,
        productivityRate: 1.0,
        departmentId: deptMap['Дизайн']
      },
      
      // Логистика
      {
        name: 'Доставка',
        description: 'Транспортировка материалов и готовой продукции',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 600,
        productivityRate: 1.0,
        departmentId: deptMap['Логистика']
      },
      {
        name: 'Складские операции',
        description: 'Прием, хранение и выдача материалов',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 550,
        productivityRate: 1.0,
        departmentId: deptMap['Логистика']
      },
      {
        name: 'Логистическое планирование',
        description: 'Планирование и координация поставок',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 750,
        productivityRate: 1.0,
        departmentId: deptMap['Логистика']
      }
    ]

    let createdCount = 0
    for (const workType of workTypes) {
      await prisma.workType.create({
        data: {
          ...workType,
          isActive: true
        }
      })
      createdCount++
      console.log(`✅ Создан тип работы: ${workType.name} - ${workType.hourlyRate} руб/ч`)
    }

    console.log(`🎉 Создано ${createdCount} типов работ!`)
    
  } catch (error) {
    console.error('❌ Ошибка при создании типов работ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

loadWorkTypes()
