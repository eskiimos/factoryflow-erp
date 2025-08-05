const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createLinearProducts() {
  try {
    console.log('📏 Создание товаров с расчетом за см изделия...')

    // Проверяем/создаем группу товаров
    const productGroup = await ensureProductGroup()
    console.log(`✅ Группа товаров: ${productGroup.name}`)

    // Проверяем/создаем материалы
    const materials = await ensureLinearMaterials()
    console.log(`✅ Материалы подготовлены: ${materials.length}`)

    // Проверяем/создаем типы работ
    const workTypes = await ensureLinearWorkTypes()
    console.log(`✅ Типы работ подготовлены: ${workTypes.length}`)

    // Создаем товары с расчетом за см
    const products = await createLinearProductsData(productGroup.id, materials, workTypes)
    console.log(`✅ Товары созданы: ${products.length}`)

    console.log('🎉 Товары с расчетом за см успешно созданы!')
    console.log('🔗 Откройте /products для просмотра')
    
    // Выводим список созданных товаров
    console.log('\n📋 Созданные товары:')
    products.forEach(product => {
      console.log(`- ${product.name} (${product.baseUnit}) - ${product.basePrice} ₽/${product.baseUnit}`)
    })

  } catch (error) {
    console.error('❌ Ошибка при создании товаров:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function ensureProductGroup() {
  let group = await prisma.productGroup.findFirst({
    where: { name: 'Погонажные изделия' }
  })
  
  if (!group) {
    group = await prisma.productGroup.create({
      data: {
        name: 'Погонажные изделия',
        description: 'Изделия с расчетом стоимости за погонный метр/сантиметр',
        isActive: true
      }
    })
  }
  
  return group
}

async function ensureLinearMaterials() {
  const materialsData = [
    {
      name: 'Профиль алюминиевый 20x20мм',
      unit: 'пог.м',
      price: 120,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Профиль алюминиевый 40x40мм',
      unit: 'пог.м',
      price: 280,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Труба стальная Ø25мм',
      unit: 'пог.м',
      price: 95,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Труба стальная Ø40мм',
      unit: 'пог.м',
      price: 180,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Плинтус MDF 60мм',
      unit: 'пог.м',
      price: 85,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Молдинг деревянный 30мм',
      unit: 'пог.м',
      price: 125,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Кабель-канал 40x25мм',
      unit: 'пог.м',
      price: 65,
      isActive: true,
      baseUnit: 'пог.м',
      calculationUnit: 'см',
      conversionFactor: 0.01
    },
    {
      name: 'Уголок крепежный',
      unit: 'шт',
      price: 15,
      isActive: true,
      baseUnit: 'шт'
    },
    {
      name: 'Саморез 4x16мм',
      unit: 'шт',
      price: 2.5,
      isActive: true,
      baseUnit: 'шт'
    },
    {
      name: 'Заглушка торцевая',
      unit: 'шт',
      price: 8,
      isActive: true,
      baseUnit: 'шт'
    }
  ]

  const materials = []
  for (const materialData of materialsData) {
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

async function ensureLinearWorkTypes() {
  const workTypesData = [
    {
      name: 'Резка профиля',
      description: 'Резка алюминиевого или стального профиля',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 600,
      skillLevel: 'Рабочий',
      calculationUnit: 'см',
      productivityRate: 50, // см в час
      isActive: true
    },
    {
      name: 'Сборка конструкции',
      description: 'Сборка погонажной конструкции',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 800,
      skillLevel: 'Специалист',
      calculationUnit: 'см',
      productivityRate: 30, // см в час
      isActive: true
    },
    {
      name: 'Зачистка торцов',
      description: 'Обработка торцевых частей',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 500,
      skillLevel: 'Рабочий',
      calculationUnit: 'шт',
      productivityRate: 20, // шт в час
      isActive: true
    },
    {
      name: 'Монтаж фурнитуры',
      description: 'Установка крепежных элементов',
      unit: 'час',
      standardTime: 1.0,
      hourlyRate: 700,
      skillLevel: 'Специалист',
      calculationUnit: 'шт',
      productivityRate: 15, // шт в час
      isActive: true
    }
  ]

  const workTypes = []
  for (const workTypeData of workTypesData) {
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

async function createLinearProductsData(groupId, materials, workTypes) {
  const productsData = [
    {
      name: 'Каркас алюминиевый 20x20',
      description: 'Алюминиевый каркас из профиля 20x20мм с креплениями',
      sku: 'FRAME-AL-20x20',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 3.50, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        profileSize: '20x20мм',
        material: 'Алюминий',
        finish: 'Анодированный',
        maxLength: '600см'
      }),
      materials: [
        { materialName: 'Профиль алюминиевый 20x20мм', usagePerCm: 1.0 },
        { materialName: 'Уголок крепежный', usagePerCm: 0.1 },
        { materialName: 'Саморез 4x16мм', usagePerCm: 0.2 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.02 },
        { workTypeName: 'Сборка конструкции', timePerCm: 0.033 },
        { workTypeName: 'Монтаж фурнитуры', timePerCm: 0.01 }
      ]
    },
    {
      name: 'Каркас алюминиевый 40x40',
      description: 'Усиленный алюминиевый каркас из профиля 40x40мм',
      sku: 'FRAME-AL-40x40',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 6.20, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        profileSize: '40x40мм',
        material: 'Алюминий',
        finish: 'Анодированный',
        maxLength: '600см',
        loadCapacity: '50кг/м'
      }),
      materials: [
        { materialName: 'Профиль алюминиевый 40x40мм', usagePerCm: 1.0 },
        { materialName: 'Уголок крепежный', usagePerCm: 0.15 },
        { materialName: 'Саморез 4x16мм', usagePerCm: 0.3 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.025 },
        { workTypeName: 'Сборка конструкции', timePerCm: 0.04 },
        { workTypeName: 'Монтаж фурнитуры', timePerCm: 0.015 }
      ]
    },
    {
      name: 'Труба стальная Ø25',
      description: 'Стальная труба диаметром 25мм с обработкой торцов',
      sku: 'PIPE-ST-25',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 2.80, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        diameter: '25мм',
        material: 'Сталь',
        wallThickness: '2мм',
        maxLength: '600см'
      }),
      materials: [
        { materialName: 'Труба стальная Ø25мм', usagePerCm: 1.0 },
        { materialName: 'Заглушка торцевая', usagePerCm: 0.033 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.015 },
        { workTypeName: 'Зачистка торцов', timePerCm: 0.05 }
      ]
    },
    {
      name: 'Труба стальная Ø40',
      description: 'Усиленная стальная труба диаметром 40мм',
      sku: 'PIPE-ST-40',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 4.50, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        diameter: '40мм',
        material: 'Сталь',
        wallThickness: '3мм',
        maxLength: '600см',
        loadCapacity: '100кг/м'
      }),
      materials: [
        { materialName: 'Труба стальная Ø40мм', usagePerCm: 1.0 },
        { materialName: 'Заглушка торцевая', usagePerCm: 0.033 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.02 },
        { workTypeName: 'Зачистка торцов', timePerCm: 0.06 }
      ]
    },
    {
      name: 'Плинтус MDF 60мм',
      description: 'Плинтус из MDF высотой 60мм с покрытием',
      sku: 'BASEBOARD-MDF-60',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 1.20, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        height: '60мм',
        material: 'MDF',
        finish: 'Белый',
        maxLength: '240см'
      }),
      materials: [
        { materialName: 'Плинтус MDF 60мм', usagePerCm: 1.0 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.01 }
      ]
    },
    {
      name: 'Молдинг деревянный 30мм',
      description: 'Декоративный молдинг из натурального дерева',
      sku: 'MOLDING-WOOD-30',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 1.85, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        width: '30мм',
        material: 'Сосна',
        finish: 'Лак',
        maxLength: '200см'
      }),
      materials: [
        { materialName: 'Молдинг деревянный 30мм', usagePerCm: 1.0 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.012 },
        { workTypeName: 'Зачистка торцов', timePerCm: 0.02 }
      ]
    },
    {
      name: 'Кабель-канал 40x25мм',
      description: 'Пластиковый кабель-канал с крышкой',
      sku: 'CABLE-DUCT-40x25',
      unit: 'см',
      type: 'FINAL',
      pricingMethod: 'LINEAR',
      baseUnit: 'см',
      basePrice: 0.85, // за см
      currency: 'RUB',
      isActive: true,
      groupId: groupId,
      specifications: JSON.stringify({
        size: '40x25мм',
        material: 'PVC',
        color: 'Белый',
        maxLength: '200см'
      }),
      materials: [
        { materialName: 'Кабель-канал 40x25мм', usagePerCm: 1.0 }
      ],
      workTypes: [
        { workTypeName: 'Резка профиля', timePerCm: 0.008 }
      ]
    }
  ]

  const products = []
  for (const productData of productsData) {
    // Извлекаем данные для материалов и работ
    const { materials: productMaterials, workTypes: productWorkTypes, ...productInfo } = productData
    
    // Проверяем, существует ли товар
    let product = await prisma.product.findFirst({
      where: { name: productData.name }
    })
    
    if (!product) {
      product = await prisma.product.create({
        data: productInfo
      })
      
      // Добавляем материалы
      for (const materialUsage of productMaterials) {
        const material = materials.find(m => m.name === materialUsage.materialName)
        if (material) {
          await prisma.productMaterialUsage.create({
            data: {
              productId: product.id,
              materialItemId: material.id,
              quantity: materialUsage.usagePerCm,
              cost: material.price * materialUsage.usagePerCm,
              unitType: 'per_length',
              baseQuantity: materialUsage.usagePerCm,
              calculationFormula: `length * ${materialUsage.usagePerCm}`
            }
          })
        }
      }
      
      // Добавляем работы
      for (const workUsage of productWorkTypes) {
        const workType = workTypes.find(w => w.name === workUsage.workTypeName)
        if (workType) {
          await prisma.productWorkTypeUsage.create({
            data: {
              productId: product.id,
              workTypeId: workType.id,
              quantity: workUsage.timePerCm,
              cost: workType.hourlyRate * workUsage.timePerCm,
              unitType: 'per_length',
              baseTime: workUsage.timePerCm,
              calculationFormula: `length * ${workUsage.timePerCm}`
            }
          })
        }
      }
    }
    
    products.push(product)
  }

  return products
}

// Запускаем создание товаров
createLinearProducts()
