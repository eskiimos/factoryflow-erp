const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugFormulas() {
  try {
    // Получаем все формулы из шаблона лестницы
    const template = await prisma.template.findFirst({
      where: { name: 'Деревянная лестница' },
      include: {
        formulas: {
          include: {
            formula: true
          },
          orderBy: { executionOrder: 'asc' }
        }
      }
    })

    if (!template) {
      console.log('❌ Шаблон не найден')
      return
    }

    console.log('📋 Формулы в шаблоне:')
    template.formulas.forEach(tf => {
      console.log(`${tf.executionOrder}. ${tf.formula.code}: ${tf.formula.expression}`)
      console.log(`   Входные параметры: ${tf.formula.inputParameters}`)
      console.log(`   Результат: ${tf.formula.outputVariable}\n`)
    })

    // Проверим проблемную формулу количества ступеней
    const stepsFormula = await prisma.formula.findUnique({
      where: { code: 'CALC_STEPS_AUTO' }
    })

    if (stepsFormula) {
      console.log('🔍 Формула количества ступеней:')
      console.log(`Expression: ${stepsFormula.expression}`)
      console.log(`Input params: ${stepsFormula.inputParameters}`)
      console.log(`Output var: ${stepsFormula.outputVariable}`)
      
      // Проверим выражение вручную
      const HEIGHT = 2500
      const result = Math.ceil(HEIGHT / 280)
      console.log(`Ручной расчет: Math.ceil(${HEIGHT} / 280) = ${result}`)
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugFormulas()
