import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedWorkData() {
  console.log('🌱 Добавление тестовых данных для отделов и видов работ...')

  // Создание отделов
  const departments = [
    {
      name: 'Производство',
      description: 'Основное производство изделий'
    },
    {
      name: 'Сборка',
      description: 'Сборка готовых изделий'
    },
    {
      name: 'Контроль качества',
      description: 'Проверка качества продукции'
    },
    {
      name: 'Обслуживание',
      description: 'Техническое обслуживание оборудования'
    },
    {
      name: 'Упаковка',
      description: 'Упаковка готовой продукции'
    }
  ]

  console.log('📦 Создание отделов...')
  const createdDepartments = []
  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
    createdDepartments.push(department)
    console.log(`✅ Отдел: ${department.name}`)
  }

  // Создание видов работ
  const workTypes = [
    // Производство
    {
      name: 'Токарная обработка',
      description: 'Обработка деталей на токарном станке',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 800,
      skillLevel: 'Специалист',
      equipmentRequired: 'Токарный станок, режущий инструмент',
      safetyRequirements: 'Защитные очки, спецодежда',
      departmentId: createdDepartments[0].id
    },
    {
      name: 'Фрезерная обработка',
      description: 'Обработка деталей на фрезерном станке',
      unit: 'час',
      standardTime: 1.2,
      hourlyRate: 850,
      skillLevel: 'Специалист',
      equipmentRequired: 'Фрезерный станок, фрезы',
      safetyRequirements: 'Защитные очки, спецодежда',
      departmentId: createdDepartments[0].id
    },
    {
      name: 'Сварочные работы',
      description: 'Сварка металлических конструкций',
      unit: 'час',
      standardTime: 0.8,
      hourlyRate: 900,
      skillLevel: 'Эксперт',
      equipmentRequired: 'Сварочный аппарат, электроды',
      safetyRequirements: 'Сварочная маска, защитная одежда',
      departmentId: createdDepartments[0].id
    },
    
    // Сборка
    {
      name: 'Механическая сборка',
      description: 'Сборка механических узлов',
      unit: 'шт',
      standardTime: 2.0,
      hourlyRate: 600,
      skillLevel: 'Рабочий',
      equipmentRequired: 'Набор инструментов, пневмогайковерт',
      safetyRequirements: 'Защитные перчатки',
      departmentId: createdDepartments[1].id
    },
    {
      name: 'Электромонтаж',
      description: 'Монтаж электрических соединений',
      unit: 'час',
      standardTime: 1.5,
      hourlyRate: 750,
      skillLevel: 'Специалист',
      equipmentRequired: 'Электроинструмент, мультиметр',
      safetyRequirements: 'Диэлектрические перчатки',
      departmentId: createdDepartments[1].id
    },
    
    // Контроль качества
    {
      name: 'Входной контроль',
      description: 'Контроль качества поступающих материалов',
      unit: 'операция',
      standardTime: 0.5,
      hourlyRate: 550,
      skillLevel: 'Рабочий',
      equipmentRequired: 'Измерительные инструменты',
      safetyRequirements: 'Базовая спецодежда',
      departmentId: createdDepartments[2].id
    },
    {
      name: 'Финальный контроль',
      description: 'Окончательная проверка готовой продукции',
      unit: 'шт',
      standardTime: 1.0,
      hourlyRate: 650,
      skillLevel: 'Специалист',
      equipmentRequired: 'Контрольно-измерительные приборы',
      safetyRequirements: 'Защитные очки',
      departmentId: createdDepartments[2].id
    },
    
    // Обслуживание
    {
      name: 'Плановое ТО',
      description: 'Плановое техническое обслуживание оборудования',
      unit: 'час',
      standardTime: 4.0,
      hourlyRate: 700,
      skillLevel: 'Специалист',
      equipmentRequired: 'Набор слесарного инструмента',
      safetyRequirements: 'Полная спецодежда',
      departmentId: createdDepartments[3].id
    },
    {
      name: 'Аварийный ремонт',
      description: 'Устранение аварийных поломок',
      unit: 'час',
      standardTime: 2.0,
      hourlyRate: 1000,
      skillLevel: 'Эксперт',
      equipmentRequired: 'Универсальный набор инструментов',
      safetyRequirements: 'Полная спецодежда, каска',
      departmentId: createdDepartments[3].id
    },
    
    // Упаковка
    {
      name: 'Упаковка изделий',
      description: 'Упаковка готовой продукции',
      unit: 'шт',
      standardTime: 0.3,
      hourlyRate: 400,
      skillLevel: 'Стажер',
      equipmentRequired: 'Упаковочные материалы',
      safetyRequirements: 'Защитные перчатки',
      departmentId: createdDepartments[4].id
    },
    {
      name: 'Маркировка и этикетирование',
      description: 'Нанесение маркировки и этикеток',
      unit: 'шт',
      standardTime: 0.2,
      hourlyRate: 450,
      skillLevel: 'Рабочий',
      equipmentRequired: 'Принтер этикеток, маркеры',
      safetyRequirements: 'Базовая спецодежда',
      departmentId: createdDepartments[4].id
    }
  ]

  console.log('🔧 Создание видов работ...')
  for (const workType of workTypes) {
    const created = await prisma.workType.upsert({
      where: { 
        // Используем составной ключ для уникальности
        id: `temp-${workType.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: workType
    })
    console.log(`✅ Вид работы: ${created.name} (${created.skillLevel})`)
  }

  console.log('✨ Тестовые данные для видов работ успешно добавлены!')
}

seedWorkData()
  .catch((e) => {
    console.error('❌ Ошибка при добавлении тестовых данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
