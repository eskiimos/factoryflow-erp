const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createOfficeFurnitureTemplate() {
  console.log('🏢 Создание шаблона "Офисная мебель"...')

  try {
    // 1. Создаем новые параметры для офисной мебели
    const furnitureParams = [
      {
        code: 'FURNITURE_TYPE',
        name: 'Тип мебели',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'desk', label: 'Письменный стол' },
          { value: 'cabinet', label: 'Шкаф' },
          { value: 'chair', label: 'Кресло' },
          { value: 'shelf', label: 'Стеллаж' }
        ])
      },
      {
        code: 'MATERIAL_TYPE',
        name: 'Материал',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'mdf', label: 'МДФ' },
          { value: 'chipboard', label: 'ДСП' },
          { value: 'solid_wood', label: 'Массив дерева' },
          { value: 'metal', label: 'Металл' }
        ])
      },
      {
        code: 'SURFACE_AREA',
        name: 'Площадь поверхности',
        type: 'AREA',
        unit: 'м²',
        minValue: 0.1,
        maxValue: 50
      },
      {
        code: 'COMPLEXITY',
        name: 'Сложность изготовления',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'simple', label: 'Простая' },
          { value: 'medium', label: 'Средняя' },
          { value: 'complex', label: 'Сложная' }
        ])
      },
      {
        code: 'FINISH_TYPE',
        name: 'Тип отделки',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'laminate', label: 'Ламинирование' },
          { value: 'veneer', label: 'Шпонирование' },
          { value: 'paint', label: 'Покраска' },
          { value: 'none', label: 'Без отделки' }
        ])
      },
      {
        code: 'ORDER_QUANTITY',
        name: 'Количество единиц',
        type: 'NUMBER',
        unit: 'шт',
        minValue: 1,
        maxValue: 1000
      },
      {
        code: 'DELIVERY_REQUIRED',
        name: 'Требуется доставка',
        type: 'BOOLEAN'
      }
    ]

    // Создаем параметры
    const createdParams = []
    for (const param of furnitureParams) {
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

    // 2. Создаем формулы для офисной мебели
    const furnitureFormulas = [
      {
        code: 'MATERIAL_COST_CALC',
        name: 'Расчет стоимости материала',
        expression: 'SURFACE_AREA * (MATERIAL_TYPE === "mdf" ? 2000 : MATERIAL_TYPE === "chipboard" ? 1200 : MATERIAL_TYPE === "solid_wood" ? 5000 : MATERIAL_TYPE === "metal" ? 3000 : 1500)',
        inputParameters: JSON.stringify(['SURFACE_AREA', 'MATERIAL_TYPE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'COMPLEXITY_MULTIPLIER',
        name: 'Коэффициент сложности',
        expression: 'COMPLEXITY === "simple" ? 1.0 : COMPLEXITY === "medium" ? 1.5 : COMPLEXITY === "complex" ? 2.0 : 1.0',
        inputParameters: JSON.stringify(['COMPLEXITY']),
        outputType: 'NUMBER'
      },
      {
        code: 'FINISH_COST_CALC',
        name: 'Стоимость отделки',
        expression: 'SURFACE_AREA * (FINISH_TYPE === "laminate" ? 500 : FINISH_TYPE === "veneer" ? 1500 : FINISH_TYPE === "paint" ? 800 : 0)',
        inputParameters: JSON.stringify(['SURFACE_AREA', 'FINISH_TYPE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'FURNITURE_PRODUCTION_TIME',
        name: 'Время изготовления',
        expression: 'SURFACE_AREA * complexity_factor * (FURNITURE_TYPE === "desk" ? 2 : FURNITURE_TYPE === "cabinet" ? 3 : FURNITURE_TYPE === "chair" ? 4 : 2.5)',
        inputParameters: JSON.stringify(['SURFACE_AREA', 'COMPLEXITY', 'FURNITURE_TYPE']),
        outputType: 'NUMBER',
        outputUnit: 'час'
      },
      {
        code: 'VOLUME_DISCOUNT_FURNITURE',
        name: 'Скидка за объем',
        expression: 'ORDER_QUANTITY >= 50 ? 20 : ORDER_QUANTITY >= 20 ? 15 : ORDER_QUANTITY >= 10 ? 10 : ORDER_QUANTITY >= 5 ? 5 : 0',
        inputParameters: JSON.stringify(['ORDER_QUANTITY']),
        outputType: 'NUMBER',
        outputUnit: '%'
      }
    ]

    const createdFormulas = []
    for (const formula of furnitureFormulas) {
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

    // 3. Создаем шаблон "Офисная мебель"
    const officeTemplate = await prisma.template.create({
      data: {
        code: 'OFFICE_FURNITURE',
        name: 'Офисная мебель',
        description: 'Расчет стоимости изготовления офисной мебели на заказ',
        category: 'Мебель',
        subcategory: 'Офисная',
        basePrice: 15000,
        marginPercent: 30,
        stepByStep: true,
        previewEnabled: true,
        version: '1.0'
      }
    })

    console.log(`✅ Создан шаблон: ${officeTemplate.name} (ID: ${officeTemplate.id})`)

    // 4. Связываем параметры с шаблоном
    for (let i = 0; i < createdParams.length; i++) {
      const param = createdParams[i]
      const isRequired = ['FURNITURE_TYPE', 'MATERIAL_TYPE', 'SURFACE_AREA', 'ORDER_QUANTITY'].includes(param.code)

      await prisma.templateParameter.create({
        data: {
          templateId: officeTemplate.id,
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
          templateId: officeTemplate.id,
          formulaId: formula.id,
          executionOrder: (i + 1) * 10,
          outputVariable: formula.code.toLowerCase(),
          outputLabel: formula.name
        }
      })
      console.log(`✅ Связана формула ${formula.code} с шаблоном`)
    }

    console.log(`\n🎉 Шаблон "Офисная мебель" успешно создан!`)
    console.log(`📊 Параметров: ${createdParams.length}`)
    console.log(`🧮 Формул: ${createdFormulas.length}`)
    console.log(`🆔 ID шаблона: ${officeTemplate.id}`)

  } catch (error) {
    console.error('❌ Ошибка при создании шаблона:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOfficeFurnitureTemplate()
