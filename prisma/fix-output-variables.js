const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixOutputVariables() {
  console.log('🔧 Исправление выходных переменных для формул...')

  try {
    // Получаем ID шаблона лестницы
    const template = await prisma.template.findFirst({
      where: { name: 'Деревянная лестница' }
    })

    if (!template) {
      console.log('❌ Шаблон не найден')
      return
    }

    // Исправляем выходные переменные в связях TemplateFormula
    const formulaMappings = [
      { code: 'CALC_STEPS_AUTO', outputVariable: 'calculated_steps', outputLabel: 'Рассчитанное количество ступеней' },
      { code: 'CALC_VOLUME', outputVariable: 'wood_volume', outputLabel: 'Объем древесины' },
      { code: 'CALC_HANDRAIL_LENGTH', outputVariable: 'handrail_length', outputLabel: 'Длина поручня' },
      { code: 'WOOD_PRICE_MODIFIER', outputVariable: 'wood_modifier', outputLabel: 'Коэффициент цены древесины' },
      { code: 'CALC_PRODUCTION_TIME', outputVariable: 'production_time', outputLabel: 'Время производства' },
      { code: 'QUANTITY_DISCOUNT', outputVariable: 'discount_percent', outputLabel: 'Скидка за количество' }
    ]

    for (const mapping of formulaMappings) {
      // Находим формулу
      const formula = await prisma.formula.findUnique({
        where: { code: mapping.code }
      })

      if (!formula) {
        console.log(`❌ Формула ${mapping.code} не найдена`)
        continue
      }

      // Обновляем связь TemplateFormula
      const updated = await prisma.templateFormula.updateMany({
        where: {
          templateId: template.id,
          formulaId: formula.id
        },
        data: {
          outputVariable: mapping.outputVariable,
          outputLabel: mapping.outputLabel
        }
      })

      if (updated.count > 0) {
        console.log(`✅ Исправлена переменная для ${mapping.code}: ${mapping.outputVariable}`)
      } else {
        console.log(`❌ Не найдена связь для ${mapping.code}`)
      }
    }

    // Проверим результат
    const templateFormulas = await prisma.templateFormula.findMany({
      where: { templateId: template.id },
      include: { formula: true },
      orderBy: { executionOrder: 'asc' }
    })

    console.log('\n📋 Исправленные связи:')
    templateFormulas.forEach(tf => {
      console.log(`${tf.formula.code} → ${tf.outputVariable} (${tf.outputLabel})`)
    })

  } catch (error) {
    console.error('❌ Ошибка при исправлении переменных:', error)
  }
}

async function main() {
  await fixOutputVariables()
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
