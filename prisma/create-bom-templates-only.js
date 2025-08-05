const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createBomTemplatesOnly() {
  console.log('📋 Создание BOM-шаблонов для калькуляторов...')

  try {
    // Получаем существующие ресурсы
    const existingResources = await prisma.resource.findMany({
      select: { id: true, code: true, name: true, type: true }
    })

    const resourceMap = {}
    existingResources.forEach(r => {
      resourceMap[r.code] = r
    })

    console.log(`✅ Найдено ${existingResources.length} существующих ресурсов`)

    // 1. Создаем BOM-шаблон для лестницы
    const ladderTemplate = await prisma.template.findUnique({
      where: { id: 'cmdegjp1e0000ugzj4dk1nb4x' }
    })

    if (!ladderTemplate) {
      console.log('❌ Шаблон лестницы не найден')
      return
    }

    // Проверяем есть ли уже BOM-шаблон для лестницы
    const existingLadderBom = await prisma.bomTemplate.findUnique({
      where: { templateId: ladderTemplate.id }
    })

    if (!existingLadderBom) {
      const ladderBom = await prisma.bomTemplate.create({
        data: {
          templateId: ladderTemplate.id,
          includeWaste: true,
          includeSetup: true,
          roundQuantities: true
        }
      })

      // Создаем элементы BOM для лестницы
      const ladderBomItems = [
        {
          resourceCode: 'WOOD_BOARD',
          quantityFormula: 'wood_volume * 0.85',
          quantityUnit: 'м³',
          groupName: 'Основные материалы',
          sortOrder: 10
        },
        {
          resourceCode: 'STEP_WOOD',
          quantityFormula: 'calculated_steps',
          quantityUnit: 'шт',
          groupName: 'Ступени',
          sortOrder: 20
        },
        {
          resourceCode: 'HANDRAIL_WOOD',
          quantityFormula: 'handrail_length',
          quantityUnit: 'м',
          groupName: 'Поручни',
          sortOrder: 30,
          includeCondition: 'HAS_HANDRAIL'
        },
        {
          resourceCode: 'MOUNTING_BOLTS',
          quantityFormula: 'calculated_steps * 4',
          quantityUnit: 'шт',
          groupName: 'Крепеж',
          sortOrder: 40
        },
        {
          resourceCode: 'CUTTING_WORK',
          quantityFormula: 'wood_volume * 2',
          quantityUnit: 'час',
          groupName: 'Подготовительные работы',
          sortOrder: 50
        },
        {
          resourceCode: 'ASSEMBLY_WORK',
          quantityFormula: 'assembly_time',
          quantityUnit: 'час',
          groupName: 'Основные работы',
          sortOrder: 60
        }
      ]

      for (const item of ladderBomItems) {
        const resource = resourceMap[item.resourceCode]
        if (resource) {
          await prisma.bomTemplateItem.create({
            data: {
              bomTemplateId: ladderBom.id,
              resourceId: resource.id,
              quantityFormula: item.quantityFormula,
              quantityUnit: item.quantityUnit,
              groupName: item.groupName,
              sortOrder: item.sortOrder,
              includeCondition: item.includeCondition || null
            }
          })
          console.log(`✅ Добавлен элемент BOM: ${resource.name}`)
        } else {
          console.log(`❌ Ресурс не найден: ${item.resourceCode}`)
        }
      }

      console.log(`✅ Создан BOM-шаблон для лестницы: ${ladderBom.id}`)
    } else {
      console.log('♻️ BOM-шаблон для лестницы уже существует')
    }

    // 2. Создаем BOM-шаблон для металлоконструкций
    const metalTemplate = await prisma.template.findUnique({
      where: { id: 'cmdeiabtc000duglt21fu8qmx' }
    })

    if (metalTemplate) {
      const existingMetalBom = await prisma.bomTemplate.findUnique({
        where: { templateId: metalTemplate.id }
      })

      if (!existingMetalBom) {
        const metalBom = await prisma.bomTemplate.create({
          data: {
            templateId: metalTemplate.id,
            includeWaste: true,
            includeSetup: true,
            roundQuantities: true
          }
        })

        const metalBomItems = [
          {
            resourceCode: 'STEEL_ANGLE', // Используем существующий ресурс
            quantityFormula: 'METAL_WEIGHT',
            quantityUnit: 'кг',
            groupName: 'Основные материалы',
            sortOrder: 10
          },
          {
            resourceCode: 'WELDING_WORK',
            quantityFormula: 'WELDING_LENGTH * 0.5',
            quantityUnit: 'час',
            groupName: 'Основные работы',
            sortOrder: 40
          }
        ]

        for (const item of metalBomItems) {
          const resource = resourceMap[item.resourceCode]
          if (resource) {
            await prisma.bomTemplateItem.create({
              data: {
                bomTemplateId: metalBom.id,
                resourceId: resource.id,
                quantityFormula: item.quantityFormula,
                quantityUnit: item.quantityUnit,
                groupName: item.groupName,
                sortOrder: item.sortOrder
              }
            })
            console.log(`✅ Добавлен элемент BOM: ${resource.name}`)
          }
        }

        console.log(`✅ Создан BOM-шаблон для металлоконструкций: ${metalBom.id}`)
      } else {
        console.log('♻️ BOM-шаблон для металлоконструкций уже существует')
      }
    }

    // 3. Создаем дополнительные ресурсы для текстиля
    const textileResources = [
      {
        code: 'MAIN_FABRIC',
        name: 'Ткань основная',
        type: 'MATERIAL',
        baseUnit: 'м²',
        costPrice: 150,
        sellingPrice: 200,
        category: 'Ткани'
      },
      {
        code: 'THREADS',
        name: 'Нитки швейные',
        type: 'MATERIAL',
        baseUnit: 'м',
        costPrice: 0.3,
        sellingPrice: 0.5,
        category: 'Фурнитура'
      },
      {
        code: 'SEWING_WORK_TEXTILE',
        name: 'Пошив текстильных изделий',
        type: 'LABOR',
        baseUnit: 'час',
        costPrice: 250,
        sellingPrice: 350,
        category: 'Основные работы'
      }
    ]

    // Создаем недостающие ресурсы для текстиля
    for (const resourceData of textileResources) {
      if (!resourceMap[resourceData.code]) {
        const newResource = await prisma.resource.create({
          data: resourceData
        })
        resourceMap[resourceData.code] = newResource
        console.log(`✅ Создан новый ресурс: ${newResource.name}`)
      }
    }

    // 4. Создаем BOM-шаблон для текстиля
    const textileTemplate = await prisma.template.findUnique({
      where: { id: 'cmdeibcpp000dugp4pjkvg82k' }
    })

    if (textileTemplate) {
      const existingTextileBom = await prisma.bomTemplate.findUnique({
        where: { templateId: textileTemplate.id }
      })

      if (!existingTextileBom) {
        const textileBom = await prisma.bomTemplate.create({
          data: {
            templateId: textileTemplate.id,
            includeWaste: true,
            includeSetup: true,
            roundQuantities: true
          }
        })

        const textileBomItems = [
          {
            resourceCode: 'MAIN_FABRIC',
            quantityFormula: 'FABRIC_CONSUMPTION',
            quantityUnit: 'м²',
            groupName: 'Основные материалы',
            sortOrder: 10
          },
          {
            resourceCode: 'THREADS',
            quantityFormula: 'FABRIC_CONSUMPTION * 100',
            quantityUnit: 'м',
            groupName: 'Фурнитура',
            sortOrder: 20
          },
          {
            resourceCode: 'SEWING_WORK_TEXTILE',
            quantityFormula: 'sewing_time_calc',
            quantityUnit: 'час',
            groupName: 'Основные работы',
            sortOrder: 30
          }
        ]

        for (const item of textileBomItems) {
          const resource = resourceMap[item.resourceCode]
          if (resource) {
            await prisma.bomTemplateItem.create({
              data: {
                bomTemplateId: textileBom.id,
                resourceId: resource.id,
                quantityFormula: item.quantityFormula,
                quantityUnit: item.quantityUnit,
                groupName: item.groupName,
                sortOrder: item.sortOrder
              }
            })
            console.log(`✅ Добавлен элемент BOM: ${resource.name}`)
          }
        }

        console.log(`✅ Создан BOM-шаблон для текстиля: ${textileBom.id}`)
      } else {
        console.log('♻️ BOM-шаблон для текстиля уже существует')
      }
    }

    console.log(`\n🎉 BOM-шаблоны успешно созданы!`)

  } catch (error) {
    console.error('❌ Ошибка при создании BOM-шаблонов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBomTemplatesOnly()
