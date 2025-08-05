const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedLadderProduct() {
  console.log('🪜 Создаем данные для товара "Деревянная лестница"...')

  try {
    // 1. Создаем группу товаров "Лестницы"
    const ladderGroup = await prisma.productGroup.upsert({
      where: { name: 'Лестницы' },
      update: {},
      create: {
        name: 'Лестницы',
        description: 'Различные виды лестниц',
        isActive: true
      }
    })
    console.log('✅ Группа товаров "Лестницы" создана')

    // 2. Создаем подгруппу "Деревянные лестницы"
    const woodenLaddersSubgroup = await prisma.productSubgroup.upsert({
      where: { 
        groupId_name: {
          groupId: ladderGroup.id,
          name: 'Деревянные лестницы'
        }
      },
      update: {},
      create: {
        name: 'Деревянные лестницы',
        description: 'Лестницы из дерева различных пород',
        groupId: ladderGroup.id,
        isActive: true
      }
    })
    console.log('✅ Подгруппа "Деревянные лестницы" создана')

    // 3. Создаем категории материалов
    const woodCategory = await prisma.category.upsert({
      where: { name: 'Пиломатериалы' },
      update: {},
      create: {
        name: 'Пиломатериалы',
        description: 'Доски, брус, рейки и прочие пиломатериалы',
        isActive: true
      }
    })

    const hardwareCategory = await prisma.category.upsert({
      where: { name: 'Крепеж и фурнитура' },
      update: {},
      create: {
        name: 'Крепеж и фурнитура',
        description: 'Саморезы, болты, петли и прочая фурнитура',
        isActive: true
      }
    })

    const finishCategory = await prisma.category.upsert({
      where: { name: 'Лакокрасочные материалы' },
      update: {},
      create: {
        name: 'Лакокрасочные материалы',
        description: 'Лаки, краски, пропитки',
        isActive: true
      }
    })
    console.log('✅ Категории материалов созданы')

    // 4. Создаем материалы
    const materials = [
      {
        name: 'Доска сосновая 40x200x6000',
        unit: 'шт',
        price: 850.00,
        currency: 'RUB',
        categoryId: woodCategory.id,
        currentStock: 150,
        criticalMinimum: 20,
        satisfactoryLevel: 50
      },
      {
        name: 'Брус сосновый 50x50x3000',
        unit: 'шт', 
        price: 320.00,
        currency: 'RUB',
        categoryId: woodCategory.id,
        currentStock: 200,
        criticalMinimum: 30,
        satisfactoryLevel: 70
      },
      {
        name: 'Саморезы по дереву 4x50мм',
        unit: 'упак',
        price: 45.00,
        currency: 'RUB',
        categoryId: hardwareCategory.id,
        currentStock: 50,
        criticalMinimum: 5,
        satisfactoryLevel: 15
      },
      {
        name: 'Лак паркетный полиуретановый',
        unit: 'л',
        price: 1200.00,
        currency: 'RUB',
        categoryId: finishCategory.id,
        currentStock: 25,
        criticalMinimum: 3,
        satisfactoryLevel: 10
      },
      {
        name: 'Петли для лестниц',
        unit: 'шт',
        price: 350.00,
        currency: 'RUB',
        categoryId: hardwareCategory.id,
        currentStock: 40,
        criticalMinimum: 5,
        satisfactoryLevel: 15
      }
    ]

    const createdMaterials = []
    for (const material of materials) {
      // Проверяем, существует ли материал
      let created = await prisma.materialItem.findFirst({
        where: { name: material.name }
      })
      
      if (!created) {
        created = await prisma.materialItem.create({
          data: material
        })
      }
      createdMaterials.push(created)
    }
    console.log('✅ Материалы созданы')

    // 5. Создаем отделы
    const departments = [
      { name: 'Столярный цех', description: 'Производство деревянных изделий' },
      { name: 'Отделочный цех', description: 'Окраска и лакировка изделий' },
      { name: 'Сборочный цех', description: 'Финальная сборка изделий' }
    ]

    const createdDepartments = []
    for (const dept of departments) {
      let created = await prisma.department.findFirst({
        where: { name: dept.name }
      })
      
      if (!created) {
        created = await prisma.department.create({
          data: dept
        })
      }
      createdDepartments.push(created)
    }
    console.log('✅ Отделы созданы')

    // 6. Создаем сотрудников
    const employees = [
      {
        personnelNumber: 'EMP001',
        firstName: 'Иван',
        lastName: 'Петров',
        position: 'Столяр',
        skillLevel: 'Специалист',
        departmentId: createdDepartments[0].id, // Столярный цех
        hourlyRate: 650.00,
        hireDate: new Date('2023-01-15'),
        isActive: true
      },
      {
        personnelNumber: 'EMP002',
        firstName: 'Сергей',
        lastName: 'Волков',
        position: 'Маляр',
        skillLevel: 'Рабочий',
        departmentId: createdDepartments[1].id, // Отделочный цех
        hourlyRate: 580.00,
        hireDate: new Date('2023-03-10'),
        isActive: true
      },
      {
        personnelNumber: 'EMP003',
        firstName: 'Михаил',
        lastName: 'Козлов',
        position: 'Сборщик',
        skillLevel: 'Специалист',
        departmentId: createdDepartments[2].id, // Сборочный цех
        hourlyRate: 620.00,
        hireDate: new Date('2022-11-05'),
        isActive: true
      }
    ]

    const createdEmployees = []
    for (const emp of employees) {
      let created = await prisma.employee.findFirst({
        where: { personnelNumber: emp.personnelNumber }
      })
      
      if (!created) {
        created = await prisma.employee.create({
          data: emp
        })
      }
      createdEmployees.push(created)
    }
    console.log('✅ Сотрудники созданы')

    // 7. Создаем виды работ
    const workTypes = [
      {
        name: 'Распиловка досок',
        description: 'Распиловка пиломатериалов по размерам',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 650.00,
        skillLevel: 'Специалист',
        departmentId: createdDepartments[0].id,
        isActive: true
      },
      {
        name: 'Строгание и шлифовка',
        description: 'Обработка поверхности древесины',
        unit: 'час',
        standardTime: 1.5,
        hourlyRate: 650.00,
        skillLevel: 'Специалист',
        departmentId: createdDepartments[0].id,
        isActive: true
      },
      {
        name: 'Лакировка изделий',
        description: 'Покрытие лаком деревянных поверхностей',
        unit: 'час',
        standardTime: 0.5,
        hourlyRate: 580.00,
        skillLevel: 'Рабочий',
        departmentId: createdDepartments[1].id,
        isActive: true
      },
      {
        name: 'Сборка лестницы',
        description: 'Финальная сборка лестничной конструкции',
        unit: 'час',
        standardTime: 2.0,
        hourlyRate: 620.00,
        skillLevel: 'Специалист',
        departmentId: createdDepartments[2].id,
        isActive: true
      },
      {
        name: 'Установка фурнитуры',
        description: 'Монтаж петель и крепежных элементов',
        unit: 'час',
        standardTime: 1.0,
        hourlyRate: 620.00,
        skillLevel: 'Специалист',
        departmentId: createdDepartments[2].id,
        isActive: true
      }
    ]

    const createdWorkTypes = []
    for (const workType of workTypes) {
      let created = await prisma.workType.findFirst({
        where: { name: workType.name }
      })
      
      if (!created) {
        created = await prisma.workType.create({
          data: workType
        })
      }
      createdWorkTypes.push(created)
    }
    console.log('✅ Виды работ созданы')

    // 8. Создаем товар "Деревянная лестница"
    const ladderProduct = await prisma.product.upsert({
      where: { sku: 'LADDER-WOOD-001' },
      update: {},
      create: {
        name: 'Деревянная лестница "Классик"',
        description: 'Деревянная лестница из сосны с лаковым покрытием, высота 2.5м',
        sku: 'LADDER-WOOD-001',
        unit: 'шт',
        
        // Производственные данные (будут пересчитаны при создании связей)
        materialCost: 0,
        laborCost: 0,
        overheadCost: 500, // Накладные расходы
        totalCost: 0,
        
        // Коммерческие данные
        sellingPrice: 15000,
        margin: 25, // 25% маржа
        currency: 'RUB',
        
        productionTime: 8.5, // 8.5 часов на изготовление
        
        // Складские данные
        currentStock: 5,
        minStock: 2,
        maxStock: 15,
        
        // Метаданные
        tags: JSON.stringify(['лестница', 'дерево', 'сосна', 'классик']),
        specifications: JSON.stringify({
          'Высота': '2.5 м',
          'Материал': 'Сосна',
          'Покрытие': 'Лак полиуретановый',
          'Ширина ступени': '25 см',
          'Количество ступеней': 10,
          'Максимальная нагрузка': '120 кг'
        }),
        
        groupId: ladderGroup.id,
        subgroupId: woodenLaddersSubgroup.id,
        isActive: true
      }
    })
    console.log('✅ Товар "Деревянная лестница" создан')

    // 9. Создаем связи материалов с товаром (рецептура)
    const materialUsages = [
      { materialId: createdMaterials[0].id, quantity: 8, cost: 6800 }, // Доски сосновые
      { materialId: createdMaterials[1].id, quantity: 4, cost: 1280 }, // Брус
      { materialId: createdMaterials[2].id, quantity: 2, cost: 90 },   // Саморезы
      { materialId: createdMaterials[3].id, quantity: 1.5, cost: 1800 }, // Лак
      { materialId: createdMaterials[4].id, quantity: 6, cost: 2100 }  // Петли
    ]

    for (const usage of materialUsages) {
      await prisma.productMaterialUsage.upsert({
        where: {
          productId_materialItemId: {
            productId: ladderProduct.id,
            materialItemId: usage.materialId
          }
        },
        update: {
          quantity: usage.quantity,
          cost: usage.cost
        },
        create: {
          productId: ladderProduct.id,
          materialItemId: usage.materialId,
          quantity: usage.quantity,
          cost: usage.cost
        }
      })
    }
    console.log('✅ Связи материалов с товаром созданы')

    // 10. Создаем связи видов работ с товаром (технологический процесс)
    const workTypeUsages = [
      { workTypeId: createdWorkTypes[0].id, quantity: 2.5, cost: 1625, sequence: 1 }, // Распиловка
      { workTypeId: createdWorkTypes[1].id, quantity: 3.0, cost: 1950, sequence: 2 }, // Строгание
      { workTypeId: createdWorkTypes[4].id, quantity: 1.0, cost: 620, sequence: 3 },  // Установка фурнитуры
      { workTypeId: createdWorkTypes[3].id, quantity: 1.5, cost: 930, sequence: 4 },  // Сборка
      { workTypeId: createdWorkTypes[2].id, quantity: 0.5, cost: 290, sequence: 5 }   // Лакировка
    ]

    for (const usage of workTypeUsages) {
      await prisma.productWorkTypeUsage.upsert({
        where: {
          productId_workTypeId: {
            productId: ladderProduct.id,
            workTypeId: usage.workTypeId
          }
        },
        update: {
          quantity: usage.quantity,
          cost: usage.cost,
          sequence: usage.sequence
        },
        create: {
          productId: ladderProduct.id,
          workTypeId: usage.workTypeId,
          quantity: usage.quantity,
          cost: usage.cost,
          sequence: usage.sequence
        }
      })
    }
    console.log('✅ Технологический процесс создан')

    // 11. Обновляем стоимость товара
    const totalMaterialCost = materialUsages.reduce((sum, usage) => sum + usage.cost, 0)
    const totalLaborCost = workTypeUsages.reduce((sum, usage) => sum + usage.cost, 0)
    const totalCost = totalMaterialCost + totalLaborCost + 500 // + накладные расходы

    await prisma.product.update({
      where: { id: ladderProduct.id },
      data: {
        materialCost: totalMaterialCost,
        laborCost: totalLaborCost,
        totalCost: totalCost
      }
    })

    console.log('🎉 Готово! Товар "Деревянная лестница" полностью создан со всеми связями!')
    console.log(`
📊 Итоговая стоимость:
• Материалы: ${totalMaterialCost} руб
• Работы: ${totalLaborCost} руб  
• Накладные: 500 руб
• Себестоимость: ${totalCost} руб
• Цена продажи: 15000 руб
• Маржа: ${((15000 - totalCost) / 15000 * 100).toFixed(1)}%
    `)

  } catch (error) {
    console.error('❌ Ошибка при создании данных:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedLadderProduct()
