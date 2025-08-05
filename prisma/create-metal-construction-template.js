const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMetalConstructionTemplate() {
  console.log('🏗️ Создание шаблона "Металлоконструкции"...')

  try {
    // 1. Создаем новые параметры для металлоконструкций
    const metalParams = [
      {
        code: 'CONSTRUCTION_TYPE',
        name: 'Тип конструкции',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'beam', label: 'Балка' },
          { value: 'frame', label: 'Рама' },
          { value: 'truss', label: 'Ферма' },
          { value: 'column', label: 'Колонна' },
          { value: 'stairs', label: 'Лестница металлическая' }
        ])
      },
      {
        code: 'STEEL_GRADE',
        name: 'Марка стали',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'st3', label: 'Ст3' },
          { value: '09g2s', label: '09Г2С' },
          { value: 'st20', label: 'Ст20' },
          { value: '40x', label: '40Х' }
        ])
      },
      {
        code: 'METAL_WEIGHT',
        name: 'Вес металла',
        type: 'NUMBER',
        unit: 'кг',
        minValue: 1,
        maxValue: 50000
      },
      {
        code: 'WELDING_LENGTH',
        name: 'Длина сварных швов',
        type: 'LENGTH',
        unit: 'м',
        minValue: 0,
        maxValue: 1000
      },
      {
        code: 'SURFACE_TREATMENT',
        name: 'Обработка поверхности',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'none', label: 'Без обработки' },
          { value: 'primer', label: 'Грунтовка' },
          { value: 'paint', label: 'Покраска' },
          { value: 'galvanizing', label: 'Цинкование' }
        ])
      },
      {
        code: 'MACHINING_REQUIRED',
        name: 'Требуется механическая обработка',
        type: 'BOOLEAN'
      },
      {
        code: 'PIECES_COUNT',
        name: 'Количество изделий',
        type: 'NUMBER',
        unit: 'шт',
        minValue: 1,
        maxValue: 10000
      }
    ]

    // Создаем параметры
    const createdParams = []
    for (const param of metalParams) {
      const existingParam = await prisma.parameter.findUnique({
        where: { code: param.code }
      })

      if (!existingParam) {
        const newParam = await prisma.parameter.create({
          data: param
        })
        createdParams.push(newParam)
        console.log(`✅ Создан параметр: ${param.code}`)
      } else {
        createdParams.push(existingParam)
        console.log(`♻️ Используется существующий параметр: ${param.code}`)
      }
    }

    // 2. Создаем формулы для металлоконструкций
    const metalFormulas = [
      {
        code: 'STEEL_COST_CALC',
        name: 'Стоимость стали',
        expression: 'METAL_WEIGHT * (STEEL_GRADE === "st3" ? 45 : STEEL_GRADE === "09g2s" ? 52 : STEEL_GRADE === "st20" ? 48 : STEEL_GRADE === "40x" ? 65 : 50)',
        inputParameters: JSON.stringify(['METAL_WEIGHT', 'STEEL_GRADE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'WELDING_COST_CALC',
        name: 'Стоимость сварочных работ',
        expression: 'WELDING_LENGTH * (CONSTRUCTION_TYPE === "truss" ? 800 : CONSTRUCTION_TYPE === "frame" ? 600 : 500)',
        inputParameters: JSON.stringify(['WELDING_LENGTH', 'CONSTRUCTION_TYPE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'MACHINING_COST_CALC',
        name: 'Стоимость механической обработки',
        expression: 'MACHINING_REQUIRED ? METAL_WEIGHT * 15 : 0',
        inputParameters: JSON.stringify(['MACHINING_REQUIRED', 'METAL_WEIGHT']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'SURFACE_TREATMENT_COST',
        name: 'Стоимость обработки поверхности',
        expression: 'METAL_WEIGHT * (SURFACE_TREATMENT === "none" ? 0 : SURFACE_TREATMENT === "primer" ? 8 : SURFACE_TREATMENT === "paint" ? 12 : SURFACE_TREATMENT === "galvanizing" ? 25 : 0)',
        inputParameters: JSON.stringify(['METAL_WEIGHT', 'SURFACE_TREATMENT']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'METAL_PRODUCTION_TIME',
        name: 'Время изготовления',
        expression: '(WELDING_LENGTH * 0.5 + METAL_WEIGHT * 0.02 + (MACHINING_REQUIRED ? METAL_WEIGHT * 0.03 : 0))',
        inputParameters: JSON.stringify(['WELDING_LENGTH', 'METAL_WEIGHT', 'MACHINING_REQUIRED']),
        outputType: 'NUMBER',
        outputUnit: 'час'
      },
      {
        code: 'SERIES_DISCOUNT',
        name: 'Скидка за серийность',
        expression: 'PIECES_COUNT >= 100 ? 25 : PIECES_COUNT >= 50 ? 20 : PIECES_COUNT >= 20 ? 15 : PIECES_COUNT >= 10 ? 10 : 0',
        inputParameters: JSON.stringify(['PIECES_COUNT']),
        outputType: 'NUMBER',
        outputUnit: '%'
      }
    ]

    const createdFormulas = []
    for (const formula of metalFormulas) {
      const existingFormula = await prisma.formula.findUnique({
        where: { code: formula.code }
      })

      if (!existingFormula) {
        const newFormula = await prisma.formula.create({
          data: formula
        })
        createdFormulas.push(newFormula)
        console.log(`✅ Создана формула: ${formula.code}`)
      } else {
        createdFormulas.push(existingFormula)
        console.log(`♻️ Используется существующая формула: ${formula.code}`)
      }
    }

    // 3. Создаем шаблон "Металлоконструкции"
    const metalTemplate = await prisma.template.create({
      data: {
        code: 'METAL_CONSTRUCTION',
        name: 'Металлоконструкции',
        description: 'Расчет стоимости изготовления металлических конструкций',
        category: 'Производство',
        subcategory: 'Металлообработка',
        basePrice: 25000,
        marginPercent: 35,
        stepByStep: true,
        previewEnabled: true,
        version: '1.0'
      }
    })

    console.log(`✅ Создан шаблон: ${metalTemplate.name} (ID: ${metalTemplate.id})`)

    // 4. Связываем параметры с шаблоном
    for (let i = 0; i < createdParams.length; i++) {
      const param = createdParams[i]
      const isRequired = ['CONSTRUCTION_TYPE', 'STEEL_GRADE', 'METAL_WEIGHT', 'PIECES_COUNT'].includes(param.code)

      await prisma.templateParameter.create({
        data: {
          templateId: metalTemplate.id,
          parameterId: param.id,
          isRequired,
          sortOrder: (i + 1) * 10
        }
      })
      console.log(`✅ Связан параметр ${param.code} с шаблоном`)
    }

    // 5. Связываем формулы с шаблоном
    for (let i = 0; i < createdFormulas.length; i++) {
      const formula = createdFormulas[i]
      const templateFormula = await prisma.templateFormula.create({
        data: {
          templateId: metalTemplate.id,
          formulaId: formula.id,
          executionOrder: (i + 1) * 10,
          outputVariable: formula.code.toLowerCase(),
          outputLabel: formula.name
        }
      })
      console.log(`✅ Связана формула ${formula.code} с шаблоном`)
    }

    console.log(`\n🎉 Шаблон "Металлоконструкции" успешно создан!`)
    console.log(`📊 Параметров: ${createdParams.length}`)
    console.log(`🧮 Формул: ${createdFormulas.length}`)
    console.log(`🆔 ID шаблона: ${metalTemplate.id}`)

  } catch (error) {
    console.error('❌ Ошибка при создании шаблона:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMetalConstructionTemplate()
