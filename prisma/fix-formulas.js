const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFormulas() {
  console.log('🔧 Исправление формул...')

  try {
    // Исправляем формулу расчета ступеней
    await prisma.formula.update({
      where: { code: 'CALC_STEPS_AUTO' },
      data: {
        expression: 'Math.ceil(HEIGHT / 280)' // убираем лишнюю логику
      }
    })
    console.log('✅ Исправлена формула CALC_STEPS_AUTO')

    // Исправляем формулу длины поручня
    await prisma.formula.update({
      where: { code: 'CALC_HANDRAIL_LENGTH' },
      data: {
        expression: 'HAS_HANDRAIL ? Math.sqrt(LENGTH * LENGTH + HEIGHT * HEIGHT) / 1000 * 2 : 0'
      }
    })
    console.log('✅ Исправлена формула CALC_HANDRAIL_LENGTH')

    // Упрощаем формулу модификатора цены
    await prisma.formula.update({
      where: { code: 'WOOD_PRICE_MODIFIER' },
      data: {
        expression: 'WOOD_TYPE === "pine" ? 1.0 : WOOD_TYPE === "oak" ? 2.5 : WOOD_TYPE === "birch" ? 1.8 : WOOD_TYPE === "beech" ? 2.2 : 1.0'
      }
    })
    console.log('✅ Исправлена формула WOOD_PRICE_MODIFIER')

    // Упрощаем формулу скидки
    await prisma.formula.update({
      where: { code: 'QUANTITY_DISCOUNT' },
      data: {
        expression: 'QUANTITY >= 10 ? 15 : QUANTITY >= 5 ? 10 : QUANTITY >= 3 ? 5 : 0'
      }
    })
    console.log('✅ Исправлена формула QUANTITY_DISCOUNT')

    // Проверим формулы
    const formulas = await prisma.formula.findMany({
      where: {
        code: { in: ['CALC_STEPS_AUTO', 'CALC_HANDRAIL_LENGTH', 'WOOD_PRICE_MODIFIER', 'QUANTITY_DISCOUNT'] }
      }
    })

    console.log('\n📋 Актуальные формулы:')
    formulas.forEach(formula => {
      console.log(`${formula.code}: ${formula.expression}`)
    })

  } catch (error) {
    console.error('❌ Ошибка при исправлении формул:', error)
  }
}

async function main() {
  await fixFormulas()
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
