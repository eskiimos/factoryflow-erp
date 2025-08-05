import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Начинаем инициализацию базы данных...')

  // Создаем базовые категории
  const categories = [
    { name: 'Общие', description: 'Общие категории для классификации' },
    { name: 'Материалы', description: 'Категории материалов' },
    { name: 'Работы', description: 'Категории работ' },
    { name: 'Фонды', description: 'Категории фондов' },
    { name: 'Продукция', description: 'Категории продукции' }
  ]

  console.log('📂 Создаем базовые категории...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  // Создаем базовые отделы
  const departments = [
    { name: 'Производство', description: 'Основное производство' },
    { name: 'Печать', description: 'Отдел печати' },
    { name: 'Резка', description: 'Отдел резки и обработки' },
    { name: 'Монтаж', description: 'Отдел монтажа' },
    { name: 'Офис', description: 'Офисные работы' }
  ]

  console.log('🏢 Создаем базовые отделы...')
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
  }

  // Создаем базовые формулы
  const basicFormulas = [
    {
      name: '🏷️ Люверсы в баннере',
      description: 'Расчет количества люверсов по периметру баннера',
      category: 'Баннеры',
      formula: [
        { id: '1', type: 'function', value: 'Math.ceil', label: 'Округлить вверх' },
        { id: '2', type: 'variable', value: 'width', label: 'Ширина' },
        { id: '3', type: 'operator', value: '+', label: 'Сложение' },
        { id: '4', type: 'variable', value: 'height', label: 'Высота' },
        { id: '5', type: 'operator', value: '*', label: 'Умножение' },
        { id: '6', type: 'number', value: '2' },
        { id: '7', type: 'operator', value: '/', label: 'Деление' },
        { id: '8', type: 'variable', value: 'step', label: 'Шаг' }
      ],
      variables: [
        { name: 'width', label: 'Ширина', value: 3, unit: 'м' },
        { name: 'height', label: 'Высота', value: 2, unit: 'м' },
        { name: 'step', label: 'Шаг', value: 0.2, unit: 'м' }
      ]
    },
    {
      name: '📦 Материал с отходами',
      description: 'Расчет количества материала с учетом отходов',
      category: 'Материалы',
      formula: [
        { id: '1', type: 'variable', value: 'base', label: 'Базовое количество' },
        { id: '2', type: 'operator', value: '*', label: 'Умножение' },
        { id: '3', type: 'number', value: '1' },
        { id: '4', type: 'operator', value: '+', label: 'Сложение' },
        { id: '5', type: 'variable', value: 'waste', label: 'Отходы' },
        { id: '6', type: 'operator', value: '/', label: 'Деление' },
        { id: '7', type: 'number', value: '100' }
      ],
      variables: [
        { name: 'base', label: 'Базовое количество', value: 10, unit: 'м²' },
        { name: 'waste', label: 'Отходы', value: 15, unit: '%' }
      ]
    }
  ]

  console.log('🧮 Создаем базовые формулы...')
  for (const formula of basicFormulas) {
    const existing = await prisma.savedFormula.findFirst({
      where: { name: formula.name }
    })
    
    if (!existing) {
      await prisma.savedFormula.create({
        data: formula
      })
    }
  }

  console.log('✅ Инициализация базы данных завершена!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при инициализации:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
