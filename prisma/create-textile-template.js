const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTextileTemplate() {
  console.log('🧵 Создание шаблона "Текстильные изделия"...')

  try {
    // 1. Создаем новые параметры для текстиля
    const textileParams = [
      {
        code: 'PRODUCT_TYPE',
        name: 'Тип изделия',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'shirt', label: 'Рубашка' },
          { value: 'dress', label: 'Платье' },
          { value: 'pants', label: 'Брюки' },
          { value: 'jacket', label: 'Куртка' },
          { value: 'bed_linen', label: 'Постельное белье' },
          { value: 'curtains', label: 'Шторы' }
        ])
      },
      {
        code: 'FABRIC_TYPE',
        name: 'Тип ткани',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'cotton', label: 'Хлопок' },
          { value: 'linen', label: 'Лен' },
          { value: 'wool', label: 'Шерсть' },
          { value: 'silk', label: 'Шелк' },
          { value: 'polyester', label: 'Полиэстер' },
          { value: 'mixed', label: 'Смешанные волокна' }
        ])
      },
      {
        code: 'FABRIC_CONSUMPTION',
        name: 'Расход ткани',
        type: 'NUMBER',
        unit: 'м²',
        minValue: 0.1,
        maxValue: 100
      },
      {
        code: 'SIZE_RANGE',
        name: 'Размерная сетка',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'xs_s', label: 'XS-S' },
          { value: 'm_l', label: 'M-L' },
          { value: 'xl_xxl', label: 'XL-XXL' },
          { value: 'children', label: 'Детский ассортимент' },
          { value: 'universal', label: 'Универсальный размер' }
        ])
      },
      {
        code: 'COMPLEXITY_LEVEL',
        name: 'Сложность пошива',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'simple', label: 'Простая' },
          { value: 'medium', label: 'Средняя' },
          { value: 'complex', label: 'Сложная' },
          { value: 'premium', label: 'Премиум класс' }
        ])
      },
      {
        code: 'FINISHING_TYPE',
        name: 'Тип отделки',
        type: 'SELECT',
        selectOptions: JSON.stringify([
          { value: 'none', label: 'Без отделки' },
          { value: 'embroidery', label: 'Вышивка' },
          { value: 'print', label: 'Принт' },
          { value: 'beads', label: 'Бисер/стразы' },
          { value: 'lace', label: 'Кружево' }
        ])
      },
      {
        code: 'BATCH_SIZE',
        name: 'Размер партии',
        type: 'NUMBER',
        unit: 'шт',
        minValue: 1,
        maxValue: 10000
      }
    ]

    // Создаем параметры
    const createdParams = []
    for (const param of textileParams) {
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

    // 2. Создаем формулы для текстильных изделий
    const textileFormulas = [
      {
        code: 'FABRIC_COST_CALC',
        name: 'Стоимость ткани',
        expression: 'FABRIC_CONSUMPTION * (FABRIC_TYPE === "cotton" ? 150 : FABRIC_TYPE === "linen" ? 250 : FABRIC_TYPE === "wool" ? 400 : FABRIC_TYPE === "silk" ? 800 : FABRIC_TYPE === "polyester" ? 100 : FABRIC_TYPE === "mixed" ? 200 : 150)',
        inputParameters: JSON.stringify(['FABRIC_CONSUMPTION', 'FABRIC_TYPE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'SEWING_TIME_CALC',
        name: 'Время пошива',
        expression: '(PRODUCT_TYPE === "shirt" ? 2.5 : PRODUCT_TYPE === "dress" ? 4 : PRODUCT_TYPE === "pants" ? 3 : PRODUCT_TYPE === "jacket" ? 6 : PRODUCT_TYPE === "bed_linen" ? 1.5 : PRODUCT_TYPE === "curtains" ? 2 : 3) * (COMPLEXITY_LEVEL === "simple" ? 1 : COMPLEXITY_LEVEL === "medium" ? 1.3 : COMPLEXITY_LEVEL === "complex" ? 1.7 : COMPLEXITY_LEVEL === "premium" ? 2.2 : 1)',
        inputParameters: JSON.stringify(['PRODUCT_TYPE', 'COMPLEXITY_LEVEL']),
        outputType: 'NUMBER',
        outputUnit: 'час'
      },
      {
        code: 'SEWING_COST_CALC',
        name: 'Стоимость пошива',
        expression: '(PRODUCT_TYPE === "shirt" ? 2.5 : PRODUCT_TYPE === "dress" ? 4 : PRODUCT_TYPE === "pants" ? 3 : PRODUCT_TYPE === "jacket" ? 6 : PRODUCT_TYPE === "bed_linen" ? 1.5 : PRODUCT_TYPE === "curtains" ? 2 : 3) * (COMPLEXITY_LEVEL === "simple" ? 1 : COMPLEXITY_LEVEL === "medium" ? 1.3 : COMPLEXITY_LEVEL === "complex" ? 1.7 : COMPLEXITY_LEVEL === "premium" ? 2.2 : 1) * 350',
        inputParameters: JSON.stringify(['PRODUCT_TYPE', 'COMPLEXITY_LEVEL']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'FINISHING_COST_CALC',
        name: 'Стоимость отделки',
        expression: '(FINISHING_TYPE === "none" ? 0 : FINISHING_TYPE === "embroidery" ? 500 : FINISHING_TYPE === "print" ? 200 : FINISHING_TYPE === "beads" ? 800 : FINISHING_TYPE === "lace" ? 300 : 0) * (SIZE_RANGE === "xs_s" ? 0.8 : SIZE_RANGE === "xl_xxl" ? 1.3 : SIZE_RANGE === "children" ? 0.6 : 1)',
        inputParameters: JSON.stringify(['FINISHING_TYPE', 'SIZE_RANGE']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'PACKAGING_COST_CALC',
        name: 'Стоимость упаковки',
        expression: '(PRODUCT_TYPE === "jacket" || PRODUCT_TYPE === "dress" ? 50 : PRODUCT_TYPE === "bed_linen" ? 80 : 30) * (COMPLEXITY_LEVEL === "premium" ? 2 : 1)',
        inputParameters: JSON.stringify(['PRODUCT_TYPE', 'COMPLEXITY_LEVEL']),
        outputType: 'NUMBER',
        outputUnit: '₽'
      },
      {
        code: 'BATCH_DISCOUNT_CALC',
        name: 'Скидка за партию',
        expression: 'BATCH_SIZE >= 1000 ? 30 : BATCH_SIZE >= 500 ? 25 : BATCH_SIZE >= 200 ? 20 : BATCH_SIZE >= 100 ? 15 : BATCH_SIZE >= 50 ? 10 : BATCH_SIZE >= 20 ? 5 : 0',
        inputParameters: JSON.stringify(['BATCH_SIZE']),
        outputType: 'NUMBER',
        outputUnit: '%'
      }
    ]

    const createdFormulas = []
    for (const formula of textileFormulas) {
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

    // 3. Создаем шаблон "Текстильные изделия"
    const textileTemplate = await prisma.template.create({
      data: {
        code: 'TEXTILE_PRODUCTS',
        name: 'Текстильные изделия',
        description: 'Расчет стоимости пошива текстильных изделий и одежды',
        category: 'Производство',
        subcategory: 'Текстиль и одежда',
        basePrice: 1500,
        marginPercent: 45,
        stepByStep: true,
        previewEnabled: true,
        version: '1.0'
      }
    })

    console.log(`✅ Создан шаблон: ${textileTemplate.name} (ID: ${textileTemplate.id})`)

    // 4. Связываем параметры с шаблоном
    for (let i = 0; i < createdParams.length; i++) {
      const param = createdParams[i]
      const isRequired = ['PRODUCT_TYPE', 'FABRIC_TYPE', 'FABRIC_CONSUMPTION', 'BATCH_SIZE'].includes(param.code)

      await prisma.templateParameter.create({
        data: {
          templateId: textileTemplate.id,
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
          templateId: textileTemplate.id,
          formulaId: formula.id,
          executionOrder: (i + 1) * 10,
          outputVariable: formula.code.toLowerCase(),
          outputLabel: formula.name
        }
      })
      console.log(`✅ Связана формула ${formula.code} с шаблоном`)
    }

    console.log(`\n🎉 Шаблон "Текстильные изделия" успешно создан!`)
    console.log(`📊 Параметров: ${createdParams.length}`)
    console.log(`🧮 Формул: ${createdFormulas.length}`)
    console.log(`🆔 ID шаблона: ${textileTemplate.id}`)

  } catch (error) {
    console.error('❌ Ошибка при создании шаблона:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTextileTemplate()
