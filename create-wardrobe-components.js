const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createWardrobeWithComponents() {
  try {
    console.log('🏗️ Создание тестового шкафа с компонентной системой...')

    // Проверяем/создаем материалы
    const materials = await ensureMaterials()
    console.log(`✅ Материалы подготовлены: ${materials.length}`)

    // Проверяем/создаем типы работ
    const workTypes = await ensureWorkTypes()
    console.log(`✅ Типы работ подготовлены: ${workTypes.length}`)

    // Создаем продукт "Шкаф-купе"
    let product = await prisma.product.findFirst({
      where: { name: 'Шкаф-купе модульный' }
    })
    
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: 'Шкаф-купе модульный',
          description: 'Модульный шкаф-купе с раздвижными дверями',
          sku: 'SHKAF-KUPE-001',
          unit: 'шт',
          type: 'FINAL',
          pricingMethod: 'COMPONENT',
          baseUnit: 'шт',
          basePrice: 0, // Будет рассчитываться через компоненты
          currency: 'RUB',
          isActive: true
        }
      })
    }
    console.log(`✅ Продукт создан: ${product.name} (ID: ${product.id})`)

    // Создаем основные компоненты
    const components = await createMainComponents(product.id, materials, workTypes)
    console.log(`✅ Компоненты созданы: ${components.length}`)

    // Создаем подкомпоненты
    await createSubComponents(components, materials, workTypes)
    console.log('✅ Подкомпоненты созданы')

    console.log('🎉 Шкаф-купе с компонентной системой успешно создан!')
    console.log(`📋 Продукт ID: ${product.id}`)
    console.log('🔗 Откройте /calculator/component для тестирования')

  } catch (error) {
    console.error('❌ Ошибка при создании шкафа:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function ensureMaterials() {
  const materialsData = [
    {
      name: 'ЛДСП 16мм (основа)',
      unit: 'м²',
      price: 1200,
      isActive: true
    },
    {
      name: 'ЛДСП 18мм (полки)',
      unit: 'м²',
      price: 1350,
      isActive: true
    },
    {
      name: 'ДВП 3мм (задняя стенка)',
      unit: 'м²', 
      price: 400,
      isActive: true
    },
    {
      name: 'Зеркало 4мм',
      unit: 'м²',
      price: 2500,
      isActive: true
    },
    {
      name: 'Система купе (комплект)',
      unit: 'шт',
      price: 4500,
      isActive: true
    },
    {
      name: 'Полкодержатель',
      unit: 'шт',
      price: 45,
      isActive: true
    },
    {
      name: 'Штанга для одежды',
      unit: 'шт',
      price: 350,
      isActive: true
    },
    {
      name: 'Кромка ПВХ 0.4мм',
      unit: 'пог.м',
      price: 15,
      isActive: true
    }
  ]

  const materials = []
  for (const materialData of materialsData) {
    // Проверяем, существует ли материал
    let material = await prisma.materialItem.findFirst({
      where: { name: materialData.name }
    })
    
    if (!material) {
      material = await prisma.materialItem.create({
        data: materialData
      })
    }
    materials.push(material)
  }

  return materials
}

async function ensureWorkTypes() {
  const workTypesData = [
    {
      name: 'Раскрой ЛДСП',
      description: 'Раскрой листовых материалов на форматно-раскроечном станке',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 800,
      skillLevel: 'Рабочий',
      isActive: true
    },
    {
      name: 'Кромление',
      description: 'Приклеивание кромки ПВХ',
      unit: 'час', 
      standardTime: 1.0,
      hourlyRate: 600,
      skillLevel: 'Рабочий',
      isActive: true
    },
    {
      name: 'Сверление',
      description: 'Сверление технологических отверстий',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 500,
      skillLevel: 'Рабочий',
      isActive: true
    },
    {
      name: 'Сборка корпуса',
      description: 'Сборка корпусной мебели',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 700,
      skillLevel: 'Специалист',
      isActive: true
    },
    {
      name: 'Установка фурнитуры',
      description: 'Установка направляющих, петель, ручек',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 600,
      skillLevel: 'Рабочий',
      isActive: true
    },
    {
      name: 'Установка дверей-купе',
      description: 'Установка раздвижной системы и дверей',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 900,
      skillLevel: 'Специалист',
      isActive: true
    }
  ]

  const workTypes = []
  for (const workTypeData of workTypesData) {
    // Проверяем, существует ли тип работы
    let workType = await prisma.workType.findFirst({
      where: { name: workTypeData.name }
    })
    
    if (!workType) {
      workType = await prisma.workType.create({
        data: workTypeData
      })
    }
    workTypes.push(workType)
  }

  return workTypes
}

async function createMainComponents(productId, materials, workTypes) {
  const componentsData = [
    {
      name: 'Корпус шкафа',
      description: 'Основной корпус шкафа-купе без дверей',
      componentType: 'MAIN',
      baseQuantity: 1,
      quantityFormula: '1',
      sortOrder: 1,
      isActive: true
    },
    {
      name: 'Двери-купе',
      description: 'Раздвижные двери с направляющими',
      componentType: 'MAIN', 
      baseQuantity: 2,
      quantityFormula: 'doorCount',
      sortOrder: 2,
      isActive: true
    },
    {
      name: 'Полки регулируемые',
      description: 'Регулируемые по высоте полки',
      componentType: 'OPTIONAL',
      baseQuantity: 3,
      quantityFormula: 'shelfCount',
      sortOrder: 3,
      isActive: true
    },
    {
      name: 'Штанга для одежды',
      description: 'Штанга для вешалок',
      componentType: 'OPTIONAL',
      baseQuantity: 1,
      quantityFormula: '1',
      includeCondition: 'hasHandrail === true',
      sortOrder: 4,
      isActive: true
    }
  ]

  const components = []
  for (const componentData of componentsData) {
    const component = await prisma.productComponent.create({
      data: {
        ...componentData,
        productId
      }
    })

    // Добавляем материалы к компонентам
    await addMaterialsToComponent(component, materials, workTypes)
    components.push(component)
  }

  return components
}

async function addMaterialsToComponent(component, materials, workTypes) {
  switch (component.name) {
    case 'Корпус шкафа':
      // ЛДСП для боковин, верха, низа
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'ЛДСП 16мм (основа)').id,
          usageFormula: '((width * height * 2) + (width * depth * 2) + (height * depth * 2)) / 1000000',
          baseUsage: 0,
          wasteFactor: 1.15,
          unit: 'м²'
        }
      })

      // ДВП для задней стенки
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'ДВП 3мм (задняя стенка)').id,
          usageFormula: '(width * height) / 1000000',
          baseUsage: 0,
          wasteFactor: 1.10,
          unit: 'м²'
        }
      })

      // Кромка
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Кромка ПВХ 0.4мм').id,
          usageFormula: '((width * 4) + (height * 8) + (depth * 4)) / 1000',
          baseUsage: 0,
          wasteFactor: 1.10,
          unit: 'пог.м'
        }
      })

      // Работы
      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Раскрой ЛДСП').id,
          timeFormula: '((width + height + depth) / 1000) * 0.5',
          baseTime: 0,
          unit: 'час'
        }
      })

      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Кромление').id,
          timeFormula: '((width + height + depth) / 1000) * 0.3',
          baseTime: 0,
          unit: 'час'
        }
      })

      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Сборка корпуса').id,
          timeFormula: '2',
          baseTime: 2,
          unit: 'час'
        }
      })
      break

    case 'Двери-купе':
      // Система купе
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Система купе (комплект)').id,
          usageFormula: '1',
          baseUsage: 1,
          wasteFactor: 1.05,
          unit: 'шт'
        }
      })

      // Зеркало (предполагаем одну дверь с зеркалом)
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Зеркало 4мм').id,
          usageFormula: '((width / doorCount) * height) / 1000000',
          baseUsage: 0,
          wasteFactor: 1.20,
          unit: 'м²'
        }
      })

      // ЛДСП для второй двери
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'ЛДСП 16мм (основа)').id,
          usageFormula: '((width / doorCount) * height) / 1000000',
          baseUsage: 0,
          wasteFactor: 1.15,
          unit: 'м²'
        }
      })

      // Работы
      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Установка дверей-купе').id,
          timeFormula: '1.5',
          baseTime: 1.5,
          unit: 'час'
        }
      })
      break

    case 'Полки регулируемые':
      // ЛДСП для полок
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'ЛДСП 18мм (полки)').id,
          usageFormula: '((width - 32) * (depth - 16)) / 1000000',
          baseUsage: 0,
          wasteFactor: 1.15,
          unit: 'м²'
        }
      })

      // Полкодержатели
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Полкодержатель').id,
          usageFormula: '4',
          baseUsage: 4,
          wasteFactor: 1.0,
          unit: 'шт'
        }
      })

      // Кромка
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Кромка ПВХ 0.4мм').id,
          usageFormula: '((width + depth) * 2) / 1000',
          baseUsage: 0,
          wasteFactor: 1.10,
          unit: 'пог.м'
        }
      })

      // Работы
      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Раскрой ЛДСП').id,
          timeFormula: '0.2',
          baseTime: 0.2,
          unit: 'час'
        }
      })

      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Кромление').id,
          timeFormula: '0.15',
          baseTime: 0.15,
          unit: 'час'
        }
      })
      break

    case 'Штанга для одежды':
      // Штанга
      await prisma.componentMaterialUsage.create({
        data: {
          componentId: component.id,
          materialItemId: materials.find(m => m.name === 'Штанга для одежды').id,
          usageFormula: '1',
          baseUsage: 1,
          wasteFactor: 1.0,
          unit: 'шт'
        }
      })

      // Работы
      await prisma.componentWorkTypeUsage.create({
        data: {
          componentId: component.id,
          workTypeId: workTypes.find(w => w.name === 'Установка фурнитуры').id,
          timeFormula: '0.3',
          baseTime: 0.3,
          unit: 'час'
        }
      })
      break
  }
}

async function createSubComponents(components, materials, workTypes) {
  // Пока не создаем подкомпоненты, но структура готова
  console.log('Подкомпоненты будут добавлены в следующих версиях')
}

// Запускаем создание шкафа
createWardrobeWithComponents()
