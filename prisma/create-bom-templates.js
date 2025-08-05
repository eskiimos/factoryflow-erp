const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createBomTemplates() {
  console.log('📋 Создание BOM-шаблонов для калькуляторов...')

  try {
    // 1. BOM-шаблон для деревянной лестницы
    const ladderBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdegjp1e0000ugzj4dk1nb4x', // ID шаблона лестницы
        name: 'Спецификация деревянной лестницы',
        description: 'Полная спецификация материалов и работ для изготовления деревянной лестницы',
        items: JSON.stringify([
          {
            type: 'MATERIAL',
            code: 'WOOD_BOARD',
            name: 'Доска {{WOOD_TYPE}} {{LADDER_WIDTH}}x40мм',
            quantity: '{{wood_volume}} * 0.85',
            unit: 'м³',
            unitPrice: '{{WOOD_TYPE === "pine" ? 15000 : WOOD_TYPE === "oak" ? 35000 : WOOD_TYPE === "birch" ? 25000 : 20000}}',
            category: 'Основные материалы'
          },
          {
            type: 'MATERIAL', 
            code: 'STEP_WOOD',
            name: 'Ступени из {{WOOD_TYPE}}',
            quantity: '{{calculated_steps}}',
            unit: 'шт',
            unitPrice: '{{WOOD_TYPE === "pine" ? 800 : WOOD_TYPE === "oak" ? 1500 : WOOD_TYPE === "birch" ? 1200 : 1000}}',
            category: 'Ступени'
          },
          {
            type: 'MATERIAL',
            code: 'HANDRAIL_WOOD',
            name: 'Поручень {{WOOD_TYPE}}',
            quantity: '{{handrail_length}}',
            unit: 'м',
            unitPrice: '{{WOOD_TYPE === "pine" ? 600 : WOOD_TYPE === "oak" ? 1200 : WOOD_TYPE === "birch" ? 900 : 800}}',
            category: 'Поручни и ограждения',
            condition: '{{HAS_HANDRAIL}}'
          },
          {
            type: 'HARDWARE',
            code: 'MOUNTING_BOLTS',
            name: 'Болты крепежные М8x120',
            quantity: '{{calculated_steps}} * 4',
            unit: 'шт',
            unitPrice: 25,
            category: 'Крепеж'
          },
          {
            type: 'HARDWARE',
            code: 'WOOD_SCREWS',
            name: 'Саморезы по дереву 4x50',
            quantity: '{{calculated_steps}} * 8',
            unit: 'шт',
            unitPrice: 3,
            category: 'Крепеж'
          },
          {
            type: 'WORK',
            code: 'CUTTING_WORK',
            name: 'Распиловка пиломатериалов',
            quantity: '{{wood_volume}} * 2',
            unit: 'час',
            unitPrice: 800,
            category: 'Подготовительные работы'
          },
          {
            type: 'WORK',
            code: 'ASSEMBLY_WORK',
            name: 'Сборка лестницы',
            quantity: '{{assembly_time}}',
            unit: 'час',
            unitPrice: 1200,
            category: 'Основные работы'
          },
          {
            type: 'FINISHING',
            code: 'WOOD_FINISH',
            name: 'Финишная обработка {{WOOD_FINISH}}',
            quantity: '{{wood_volume}} * 1.5',
            unit: 'м²',
            unitPrice: '{{WOOD_FINISH === "varnish" ? 150 : WOOD_FINISH === "oil" ? 200 : WOOD_FINISH === "stain" ? 180 : 120}}',
            category: 'Отделочные работы'
          }
        ])
      }
    })

    console.log(`✅ Создан BOM-шаблон для лестницы: ${ladderBom.id}`)

    // 2. BOM-шаблон для офисной мебели
    const furnitureBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdei86ab000cugi0z8mqzrf8', // ID шаблона офисной мебели
        name: 'Спецификация офисной мебели',
        description: 'Полная спецификация материалов для изготовления офисной мебели',
        items: JSON.stringify([
          {
            type: 'MATERIAL',
            code: 'FURNITURE_BOARD',
            name: 'Плита {{MATERIAL_TYPE}}',
            quantity: '{{SURFACE_AREA}} * 1.2',
            unit: 'м²',
            unitPrice: '{{MATERIAL_TYPE === "mdf" ? 800 : MATERIAL_TYPE === "chipboard" ? 600 : MATERIAL_TYPE === "plywood" ? 1000 : MATERIAL_TYPE === "solid_wood" ? 2500 : 800}}',
            category: 'Основные материалы'
          },
          {
            type: 'HARDWARE',
            code: 'FURNITURE_HINGES',
            name: 'Петли мебельные',
            quantity: '{{FURNITURE_TYPE === "cabinet" ? 4 : FURNITURE_TYPE === "wardrobe" ? 6 : 2}}',
            unit: 'шт',
            unitPrice: 150,
            category: 'Фурнитура'
          },
          {
            type: 'HARDWARE',
            code: 'DRAWER_SLIDES',
            name: 'Направляющие для ящиков',
            quantity: '{{FURNITURE_TYPE === "desk" ? 3 : FURNITURE_TYPE === "cabinet" ? 2 : 0}}',
            unit: 'пара',
            unitPrice: 300,
            category: 'Фурнитура'
          },
          {
            type: 'HARDWARE',
            code: 'HANDLES',
            name: 'Ручки мебельные',
            quantity: '{{FURNITURE_TYPE === "cabinet" ? 6 : FURNITURE_TYPE === "wardrobe" ? 8 : FURNITURE_TYPE === "desk" ? 3 : 2}}',
            unit: 'шт',
            unitPrice: 80,
            category: 'Фурнитура'
          },
          {
            type: 'WORK',
            code: 'CUTTING_PANELS',
            name: 'Распил панелей',
            quantity: '{{SURFACE_AREA}} * 0.5',
            unit: 'час',
            unitPrice: 600,
            category: 'Подготовительные работы'
          },
          {
            type: 'WORK',
            code: 'ASSEMBLY_FURNITURE',
            name: 'Сборка мебели',
            quantity: '{{production_time}}',
            unit: 'час',
            unitPrice: 900,
            category: 'Основные работы'
          },
          {
            type: 'FINISHING',
            code: 'SURFACE_FINISH',
            name: 'Финишная отделка {{FINISH_TYPE}}',
            quantity: '{{SURFACE_AREA}}',
            unit: 'м²',
            unitPrice: '{{finish_cost}} / {{SURFACE_AREA}}',
            category: 'Отделочные работы'
          }
        ])
      }
    })

    console.log(`✅ Создан BOM-шаблон для мебели: ${furnitureBom.id}`)

    // 3. BOM-шаблон для металлоконструкций
    const metalBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdeiabtc000duglt21fu8qmx', // ID шаблона металлоконструкций
        name: 'Спецификация металлоконструкций',
        description: 'Полная спецификация материалов и работ для изготовления металлических конструкций',
        items: JSON.stringify([
          {
            type: 'MATERIAL',
            code: 'STEEL_PROFILE',
            name: 'Профиль стальной {{STEEL_GRADE}}',
            quantity: '{{METAL_WEIGHT}}',
            unit: 'кг',
            unitPrice: '{{STEEL_GRADE === "st3" ? 45 : STEEL_GRADE === "09g2s" ? 52 : STEEL_GRADE === "st20" ? 48 : STEEL_GRADE === "40x" ? 65 : 50}}',
            category: 'Основные материалы'
          },
          {
            type: 'MATERIAL',
            code: 'WELDING_ELECTRODES',
            name: 'Электроды сварочные',
            quantity: '{{WELDING_LENGTH}} * 0.5',
            unit: 'кг',
            unitPrice: 120,
            category: 'Сварочные материалы'
          },
          {
            type: 'MATERIAL',
            code: 'CUTTING_DISCS',
            name: 'Диски отрезные',
            quantity: '{{METAL_WEIGHT}} / 100',
            unit: 'шт',
            unitPrice: 45,
            category: 'Расходные материалы'
          },
          {
            type: 'WORK',
            code: 'CUTTING_METAL',
            name: 'Резка металла',
            quantity: '{{METAL_WEIGHT}} * 0.02',
            unit: 'час',
            unitPrice: 800,
            category: 'Подготовительные работы'
          },
          {
            type: 'WORK',
            code: 'WELDING_WORK',
            name: 'Сварочные работы',
            quantity: '{{WELDING_LENGTH}} * 0.5',
            unit: 'час',
            unitPrice: '{{CONSTRUCTION_TYPE === "truss" ? 1600 : CONSTRUCTION_TYPE === "frame" ? 1200 : 1000}}',
            category: 'Основные работы'
          },
          {
            type: 'WORK',
            code: 'MACHINING_WORK',
            name: 'Механическая обработка',
            quantity: '{{MACHINING_REQUIRED ? METAL_WEIGHT * 0.03 : 0}}',
            unit: 'час',
            unitPrice: 500,
            category: 'Дополнительные работы',
            condition: '{{MACHINING_REQUIRED}}'
          },
          {
            type: 'FINISHING',
            code: 'SURFACE_TREATMENT',
            name: 'Обработка поверхности {{SURFACE_TREATMENT}}',
            quantity: '{{METAL_WEIGHT}}',
            unit: 'кг',
            unitPrice: '{{SURFACE_TREATMENT === "none" ? 0 : SURFACE_TREATMENT === "primer" ? 8 : SURFACE_TREATMENT === "paint" ? 12 : SURFACE_TREATMENT === "galvanizing" ? 25 : 0}}',
            category: 'Защитные покрытия'
          }
        ])
      }
    })

    console.log(`✅ Создан BOM-шаблон для металлоконструкций: ${metalBom.id}`)

    // 4. BOM-шаблон для текстильных изделий
    const textileBom = await prisma.bomTemplate.create({
      data: {
        templateId: 'cmdeibcpp000dugp4pjkvg82k', // ID шаблона текстиля
        name: 'Спецификация текстильных изделий',
        description: 'Полная спецификация материалов для пошива текстильных изделий',
        items: JSON.stringify([
          {
            type: 'MATERIAL',
            code: 'MAIN_FABRIC',
            name: 'Ткань основная {{FABRIC_TYPE}}',
            quantity: '{{FABRIC_CONSUMPTION}}',
            unit: 'м²',
            unitPrice: '{{FABRIC_TYPE === "cotton" ? 150 : FABRIC_TYPE === "linen" ? 250 : FABRIC_TYPE === "wool" ? 400 : FABRIC_TYPE === "silk" ? 800 : FABRIC_TYPE === "polyester" ? 100 : FABRIC_TYPE === "mixed" ? 200 : 150}}',
            category: 'Основные материалы'
          },
          {
            type: 'MATERIAL',
            code: 'LINING_FABRIC',
            name: 'Подкладочная ткань',
            quantity: '{{FABRIC_CONSUMPTION}} * 0.8',
            unit: 'м²',
            unitPrice: 80,
            category: 'Вспомогательные материалы',
            condition: '{{PRODUCT_TYPE === "jacket" || PRODUCT_TYPE === "dress"}}'
          },
          {
            type: 'HARDWARE',
            code: 'THREADS',
            name: 'Нитки швейные',
            quantity: '{{FABRIC_CONSUMPTION}} * 100',
            unit: 'м',
            unitPrice: 0.5,
            category: 'Фурнитура'
          },
          {
            type: 'HARDWARE',
            code: 'BUTTONS',
            name: 'Пуговицы',
            quantity: '{{PRODUCT_TYPE === "shirt" ? 8 : PRODUCT_TYPE === "jacket" ? 6 : PRODUCT_TYPE === "dress" ? 4 : 0}}',
            unit: 'шт',
            unitPrice: 15,
            category: 'Фурнитура'
          },
          {
            type: 'HARDWARE',
            code: 'ZIPPER',
            name: 'Молния',
            quantity: '{{PRODUCT_TYPE === "jacket" || PRODUCT_TYPE === "dress" ? 1 : 0}}',
            unit: 'шт',
            unitPrice: 80,
            category: 'Фурнитура'
          },
          {
            type: 'WORK',
            code: 'CUTTING_FABRIC',
            name: 'Раскрой ткани',
            quantity: '{{FABRIC_CONSUMPTION}} * 0.3',
            unit: 'час',
            unitPrice: 300,
            category: 'Подготовительные работы'
          },
          {
            type: 'WORK',
            code: 'SEWING_WORK',
            name: 'Пошив изделия',
            quantity: '{{sewing_time_calc}}',
            unit: 'час',
            unitPrice: 350,
            category: 'Основные работы'
          },
          {
            type: 'FINISHING',
            code: 'FINISHING_WORK',
            name: 'Отделочные работы {{FINISHING_TYPE}}',
            quantity: '1',
            unit: 'шт',
            unitPrice: '{{finishing_cost_calc}}',
            category: 'Отделочные работы',
            condition: '{{FINISHING_TYPE !== "none"}}'
          }
        ])
      }
    })

    console.log(`✅ Создан BOM-шаблон для текстиля: ${textileBom.id}`)

    console.log(`\n🎉 Все BOM-шаблоны успешно созданы!`)
    console.log(`📋 Всего создано: 4 BOM-шаблона`)

  } catch (error) {
    console.error('❌ Ошибка при создании BOM-шаблонов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBomTemplates()
