const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createResourcesAndBomTemplates() {
  console.log('📋 Создание ресурсов и BOM-шаблонов для калькуляторов...')

  try {
    // 1. Создаем ресурсы для деревянной лестницы
    const ladderResources = []
    
    // Материалы для лестницы
    const woodBoard = await prisma.resource.create({
      data: {
        code: 'WOOD_BOARD',
        name: 'Доска деревянная',
        type: 'MATERIAL',
        baseUnit: 'м³',
        costPrice: 18000,
        sellingPrice: 20000,
        category: 'Пиломатериалы'
      }
    })
    ladderResources.push(woodBoard)

    const stepWood = await prisma.resource.create({
      data: {
        code: 'STEP_WOOD',
        name: 'Ступени деревянные',
        type: 'MATERIAL',
        baseUnit: 'шт',
        costPrice: 800,
        sellingPrice: 1000,
        category: 'Ступени'
      }
    })
    ladderResources.push(stepWood)

    const handrailWood = await prisma.resource.create({
      data: {
        code: 'HANDRAIL_WOOD',
        name: 'Поручень деревянный',
        type: 'MATERIAL',
        baseUnit: 'м',
        costPrice: 600,
        sellingPrice: 800,
        category: 'Поручни'
      }
    })
    ladderResources.push(handrailWood)

    const mountingBolts = await prisma.resource.create({
      data: {
        code: 'MOUNTING_BOLTS',
        name: 'Болты крепежные М8x120',
        type: 'MATERIAL',
        baseUnit: 'шт',
        costPrice: 20,
        sellingPrice: 25,
        category: 'Крепеж'
      }
    })
    ladderResources.push(mountingBolts)

    // Работы для лестницы
    const cuttingWork = await prisma.resource.create({
      data: {
        code: 'CUTTING_WORK',
        name: 'Распиловка пиломатериалов',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 600,
        sellingPrice: 800,
        category: 'Подготовительные работы'
      }
    })
    ladderResources.push(cuttingWork)

    const assemblyWork = await prisma.resource.create({
      data: {
        code: 'ASSEMBLY_WORK',
        name: 'Сборка лестницы',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 900,
        sellingPrice: 1200,
        category: 'Основные работы'
      }
    })
    ladderResources.push(assemblyWork)

    console.log(`✅ Создано ${ladderResources.length} ресурсов для лестницы`)

    // 2. Создаем BOM-шаблон для лестницы
    const ladderBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdegjp1e0000ugzj4dk1nb4x', // ID шаблона лестницы
        includeWaste: true,
        includeSetup: true,
        roundQuantities: true
      }
    })

    // Создаем элементы BOM для лестницы
    const ladderBomItems = [
      {
        resourceId: woodBoard.id,
        quantityFormula: 'wood_volume * 0.85',
        quantityUnit: 'м³',
        groupName: 'Основные материалы',
        sortOrder: 10
      },
      {
        resourceId: stepWood.id,
        quantityFormula: 'calculated_steps',
        quantityUnit: 'шт',
        groupName: 'Ступени',
        sortOrder: 20
      },
      {
        resourceId: handrailWood.id,
        quantityFormula: 'handrail_length',
        quantityUnit: 'м',
        groupName: 'Поручни',
        sortOrder: 30,
        includeCondition: 'HAS_HANDRAIL'
      },
      {
        resourceId: mountingBolts.id,
        quantityFormula: 'calculated_steps * 4',
        quantityUnit: 'шт',
        groupName: 'Крепеж',
        sortOrder: 40
      },
      {
        resourceId: cuttingWork.id,
        quantityFormula: 'wood_volume * 2',
        quantityUnit: 'час',
        groupName: 'Подготовительные работы',
        sortOrder: 50
      },
      {
        resourceId: assemblyWork.id,
        quantityFormula: 'assembly_time',
        quantityUnit: 'час',
        groupName: 'Основные работы',
        sortOrder: 60
      }
    ]

    for (const item of ladderBomItems) {
      await prisma.bomTemplateItem.create({
        data: {
          bomTemplateId: ladderBom.id,
          ...item
        }
      })
    }

    console.log(`✅ Создан BOM-шаблон для лестницы с ${ladderBomItems.length} элементами`)

    // 3. Создаем ресурсы для металлоконструкций
    const metalResources = []

    const steelProfile = await prisma.resource.create({
      data: {
        code: 'STEEL_PROFILE',
        name: 'Профиль стальной',
        type: 'MATERIAL',
        baseUnit: 'кг',
        costPrice: 40,
        sellingPrice: 50,
        category: 'Металлопрокат'
      }
    })
    metalResources.push(steelProfile)

    const weldingElectrodes = await prisma.resource.create({
      data: {
        code: 'WELDING_ELECTRODES',
        name: 'Электроды сварочные',
        type: 'MATERIAL',
        baseUnit: 'кг',
        costPrice: 100,
        sellingPrice: 120,
        category: 'Сварочные материалы'
      }
    })
    metalResources.push(weldingElectrodes)

    const metalCutting = await prisma.resource.create({
      data: {
        code: 'CUTTING_METAL',
        name: 'Резка металла',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 600,
        sellingPrice: 800,
        category: 'Подготовительные работы'
      }
    })
    metalResources.push(metalCutting)

    const weldingWork = await prisma.resource.create({
      data: {
        code: 'WELDING_WORK',
        name: 'Сварочные работы',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 900,
        sellingPrice: 1200,
        category: 'Основные работы'
      }
    })
    metalResources.push(weldingWork)

    console.log(`✅ Создано ${metalResources.length} ресурсов для металлоконструкций`)

    // 4. Создаем BOM-шаблон для металлоконструкций
    const metalBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdeiabtc000duglt21fu8qmx', // ID шаблона металлоконструкций
        includeWaste: true,
        includeSetup: true,
        roundQuantities: true
      }
    })

    const metalBomItems = [
      {
        resourceId: steelProfile.id,
        quantityFormula: 'METAL_WEIGHT',
        quantityUnit: 'кг',
        groupName: 'Основные материалы',
        sortOrder: 10
      },
      {
        resourceId: weldingElectrodes.id,
        quantityFormula: 'WELDING_LENGTH * 0.5',
        quantityUnit: 'кг',
        groupName: 'Сварочные материалы',
        sortOrder: 20
      },
      {
        resourceId: metalCutting.id,
        quantityFormula: 'METAL_WEIGHT * 0.02',
        quantityUnit: 'час',
        groupName: 'Подготовительные работы',
        sortOrder: 30
      },
      {
        resourceId: weldingWork.id,
        quantityFormula: 'WELDING_LENGTH * 0.5',
        quantityUnit: 'час',
        groupName: 'Основные работы',
        sortOrder: 40
      }
    ]

    for (const item of metalBomItems) {
      await prisma.bomTemplateItem.create({
        data: {
          bomTemplateId: metalBom.id,
          ...item
        }
      })
    }

    console.log(`✅ Создан BOM-шаблон для металлоконструкций с ${metalBomItems.length} элементами`)

    // 5. Создаем ресурсы для текстиля
    const textileResources = []

    const fabric = await prisma.resource.create({
      data: {
        code: 'MAIN_FABRIC',
        name: 'Ткань основная',
        type: 'MATERIAL',
        baseUnit: 'м²',
        costPrice: 150,
        sellingPrice: 200,
        category: 'Ткани'
      }
    })
    textileResources.push(fabric)

    const threads = await prisma.resource.create({
      data: {
        code: 'THREADS',
        name: 'Нитки швейные',
        type: 'MATERIAL',
        baseUnit: 'м',
        costPrice: 0.3,
        sellingPrice: 0.5,
        category: 'Фурнитура'
      }
    })
    textileResources.push(threads)

    const sewingWork = await prisma.resource.create({
      data: {
        code: 'SEWING_WORK',
        name: 'Пошив изделия',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 250,
        sellingPrice: 350,
        category: 'Основные работы'
      }
    })
    textileResources.push(sewingWork)

    console.log(`✅ Создано ${textileResources.length} ресурсов для текстиля`)

    // 6. Создаем BOM-шаблон для текстиля
    const textileBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdeibcpp000dugp4pjkvg82k', // ID шаблона текстиля
        includeWaste: true,
        includeSetup: true,
        roundQuantities: true
      }
    })

    const textileBomItems = [
      {
        resourceId: fabric.id,
        quantityFormula: 'FABRIC_CONSUMPTION',
        quantityUnit: 'м²',
        groupName: 'Основные материалы',
        sortOrder: 10
      },
      {
        resourceId: threads.id,
        quantityFormula: 'FABRIC_CONSUMPTION * 100',
        quantityUnit: 'м',
        groupName: 'Фурнитура',
        sortOrder: 20
      },
      {
        resourceId: sewingWork.id,
        quantityFormula: 'sewing_time_calc',
        quantityUnit: 'час',
        groupName: 'Основные работы',
        sortOrder: 30
      }
    ]

    for (const item of textileBomItems) {
      await prisma.bomTemplateItem.create({
        data: {
          bomTemplateId: textileBom.id,
          ...item
        }
      })
    }

    console.log(`✅ Создан BOM-шаблон для текстиля с ${textileBomItems.length} элементами`)

    console.log(`\n🎉 Все BOM-шаблоны успешно созданы!`)
    console.log(`📦 Всего ресурсов: ${ladderResources.length + metalResources.length + textileResources.length}`)
    console.log(`📋 Всего BOM-шаблонов: 3`)

  } catch (error) {
    console.error('❌ Ошибка при создании ресурсов и BOM-шаблонов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createResourcesAndBomTemplates()
