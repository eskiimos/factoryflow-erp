const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedProductVariants() {
  console.log('🌱 Добавление вариантов продуктов...')

  try {
    // Найдем продукт "Лестница" 
    const ladderProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'Лестница' } },
          { name: { contains: 'лестница' } },
          { sku: { contains: 'LADDER' } }
        ]
      }
    })

    if (!ladderProduct) {
      console.log('❌ Продукт "Лестница" не найден')
      return
    }

    console.log(`✅ Найден продукт: ${ladderProduct.name}`)

    // Создаем варианты лестниц
    const variants = [
      {
        name: 'Лестница 1.5м стандартная',
        sku: 'LADDER-150-STD',
        description: 'Лестница высотой 1.5м, стандартная комплектация',
        specifications: JSON.stringify({
          height: '150см',
          material: 'Алюминий',
          weight: '3кг',
          maxLoad: '120кг',
          steps: 5
        }),
        priceModifier: -15, // -15% от базовой цены
        priceModifierType: 'PERCENTAGE',
        costModifier: -10,
        costModifierType: 'PERCENTAGE',
        productionTimeModifier: -0.5, // на полчаса быстрее
        weight: 3,
        dimensions: JSON.stringify({
          length: 150,
          width: 45,
          height: 10
        }),
        stockQuantity: 25,
        minStock: 5,
        maxStock: 50,
        sortOrder: 1
      },
      {
        name: 'Лестница 2м с поручнями',
        sku: 'LADDER-200-HANDRAIL',
        description: 'Лестница высотой 2м с дополнительными поручнями для безопасности',
        specifications: JSON.stringify({
          height: '200см',
          material: 'Алюминий',
          weight: '4.5кг',
          maxLoad: '150кг',
          steps: 7,
          hasHandrail: true
        }),
        priceModifier: 0, // базовая цена
        priceModifierType: 'PERCENTAGE',
        costModifier: 0,
        costModifierType: 'PERCENTAGE',
        productionTimeModifier: 0,
        weight: 4.5,
        dimensions: JSON.stringify({
          length: 200,
          width: 50,
          height: 12
        }),
        stockQuantity: 15,
        minStock: 3,
        maxStock: 30,
        sortOrder: 2
      },
      {
        name: 'Лестница 2.5м профессиональная',
        sku: 'LADDER-250-PRO',
        description: 'Усиленная лестница высотой 2.5м для профессионального использования',
        specifications: JSON.stringify({
          height: '250см',
          material: 'Усиленный алюминий',
          weight: '6кг',
          maxLoad: '200кг',
          steps: 9,
          hasHandrail: true,
          hasStabilizer: true,
          professional: true
        }),
        priceModifier: 25, // +25% к базовой цене
        priceModifierType: 'PERCENTAGE',
        costModifier: 20,
        costModifierType: 'PERCENTAGE',
        productionTimeModifier: 1, // на час дольше
        weight: 6,
        dimensions: JSON.stringify({
          length: 250,
          width: 55,
          height: 15
        }),
        stockQuantity: 8,
        minStock: 2,
        maxStock: 20,
        sortOrder: 3
      },
      {
        name: 'Лестница 3м промышленная',
        sku: 'LADDER-300-IND',
        description: 'Промышленная лестница высотой 3м с максимальной грузоподъемностью',
        specifications: JSON.stringify({
          height: '300см',
          material: 'Сталь с алюминиевым покрытием',
          weight: '8.5кг',
          maxLoad: '250кг',
          steps: 12,
          hasHandrail: true,
          hasStabilizer: true,
          hasLockingMechanism: true,
          industrial: true
        }),
        priceModifier: 50, // +50% к базовой цене
        priceModifierType: 'PERCENTAGE',
        costModifier: 40,
        costModifierType: 'PERCENTAGE',
        productionTimeModifier: 2, // на 2 часа дольше
        weight: 8.5,
        dimensions: JSON.stringify({
          length: 300,
          width: 60,
          height: 18
        }),
        stockQuantity: 5,
        minStock: 1,
        maxStock: 15,
        sortOrder: 4
      }
    ]

    for (const variantData of variants) {
      console.log(`📦 Создание варианта: ${variantData.name}`)
      
      const variant = await prisma.productVariant.create({
        data: {
          ...variantData,
          productId: ladderProduct.id
        }
      })

      // Добавляем характеристики для фильтрации
      const specs = JSON.parse(variantData.specifications)
      const attributes = [
        { name: 'Высота', value: specs.height, type: 'TEXT', unit: 'см', order: 1 },
        { name: 'Материал', value: specs.material, type: 'SELECT', order: 2 },
        { name: 'Вес', value: specs.weight, type: 'TEXT', unit: 'кг', order: 3 },
        { name: 'Максимальная нагрузка', value: specs.maxLoad, type: 'TEXT', unit: 'кг', order: 4 },
        { name: 'Количество ступеней', value: specs.steps.toString(), type: 'NUMBER', unit: 'шт', order: 5 }
      ]

      for (const attr of attributes) {
        await prisma.variantAttribute.create({
          data: {
            variantId: variant.id,
            attributeName: attr.name,
            attributeValue: attr.value,
            attributeType: attr.type,
            unit: attr.unit,
            displayOrder: attr.order
          }
        })
      }

      // Добавляем дополнительные опции
      const options = []
      
      if (variantData.name.includes('стандартная')) {
        options.push(
          {
            name: 'Добавить поручни',
            description: 'Дополнительные поручни для повышения безопасности',
            type: 'ADDON',
            priceModifier: 800,
            priceModifierType: 'FIXED',
            costModifier: 500,
            costModifierType: 'FIXED',
            productionTimeModifier: 0.3,
            sortOrder: 1
          },
          {
            name: 'Усиленные ступени',
            description: 'Противоскользящие усиленные ступени',
            type: 'ADDON',
            priceModifier: 600,
            priceModifierType: 'FIXED',
            costModifier: 400,
            costModifierType: 'FIXED',
            productionTimeModifier: 0.2,
            sortOrder: 2
          }
        )
      }

      if (variantData.name.includes('профессиональная') || variantData.name.includes('промышленная')) {
        options.push(
          {
            name: 'Транспортная сумка',
            description: 'Удобная сумка для транспортировки',
            type: 'ADDON',
            priceModifier: 1200,
            priceModifierType: 'FIXED',
            costModifier: 800,
            costModifierType: 'FIXED',
            productionTimeModifier: 0,
            sortOrder: 3
          },
          {
            name: 'Комплект крепежа',
            description: 'Дополнительный крепеж для стационарной установки',
            type: 'ADDON',
            priceModifier: 500,
            priceModifierType: 'FIXED',
            costModifier: 300,
            costModifierType: 'FIXED',
            productionTimeModifier: 0.1,
            sortOrder: 4
          }
        )
      }

      // Общие опции для всех вариантов
      options.push(
        {
          name: 'Цвет покрытия',
          description: 'Выберите цвет: стандартный серебристый или черный',
          type: 'ALTERNATIVE',
          priceModifier: 0,
          priceModifierType: 'FIXED',
          costModifier: 0,
          costModifierType: 'FIXED',
          productionTimeModifier: 0.5,
          isDefault: true,
          sortOrder: 10
        },
        {
          name: 'Гарантия 2 года',
          description: 'Расширенная гарантия на 2 года',
          type: 'ADDON',
          priceModifier: 10,
          priceModifierType: 'PERCENTAGE',
          costModifier: 0,
          costModifierType: 'FIXED',
          productionTimeModifier: 0,
          sortOrder: 11
        }
      )

      for (const optionData of options) {
        await prisma.variantOption.create({
          data: {
            ...optionData,
            variantId: variant.id
          }
        })
      }

      console.log(`  ✅ Добавлено ${attributes.length} характеристик и ${options.length} опций`)
    }

    console.log(`🎉 Успешно создано ${variants.length} вариантов продукта!`)
    
    // Показываем статистику
    const totalVariants = await prisma.productVariant.count()
    const totalAttributes = await prisma.variantAttribute.count()
    const totalOptions = await prisma.variantOption.count()
    
    console.log(`📊 Статистика системы вариантов:`)
    console.log(`  - Всего вариантов: ${totalVariants}`)
    console.log(`  - Всего характеристик: ${totalAttributes}`)
    console.log(`  - Всего опций: ${totalOptions}`)

  } catch (error) {
    console.error('❌ Ошибка при создании вариантов продуктов:', error)
  }
}

async function main() {
  await seedProductVariants()
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
