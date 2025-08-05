const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugSpecificFormulas() {
  console.log('🔍 Отладка проблемных формул...')

  try {
    const template = await prisma.template.findFirst({
      where: { name: 'Деревянная лестница' }
    })

    if (!template) {
      console.log('❌ Шаблон не найден')
      return
    }

    // Проверим проблемные формулы
    const problemFormulas = ['CALC_STEPS_AUTO', 'CALC_HANDRAIL_LENGTH']
    
    for (const code of problemFormulas) {
      console.log(`\n📊 Анализ формулы ${code}:`)
      
      const formula = await prisma.formula.findUnique({
        where: { code }
      })

      if (formula) {
        console.log(`Expression: ${formula.expression}`)
        console.log(`Input params: ${formula.inputParameters}`)
        
        // Получим связь с шаблоном
        const templateFormula = await prisma.templateFormula.findFirst({
          where: {
            templateId: template.id,
            formulaId: formula.id
          }
        })

        if (templateFormula) {
          console.log(`Output variable: ${templateFormula.outputVariable}`)
          console.log(`Output label: ${templateFormula.outputLabel}`)
        }

        // Проверим выражение вручную с тестовыми данными
        if (code === 'CALC_STEPS_AUTO') {
          const HEIGHT = 2500
          const result = Math.ceil(HEIGHT / 280)
          console.log(`Ручной расчет: Math.ceil(${HEIGHT} / 280) = ${result}`)
          console.log(`Ожидаемый результат: 9 ступеней`)
        }

        if (code === 'CALC_HANDRAIL_LENGTH') {
          const LENGTH = 3000, HEIGHT = 2500, HAS_HANDRAIL = true
          const result = HAS_HANDRAIL ? Math.sqrt(LENGTH * LENGTH + HEIGHT * HEIGHT) / 1000 * 2 : 0
          console.log(`Ручной расчет: HAS_HANDRAIL ? Math.sqrt(${LENGTH}² + ${HEIGHT}²) / 1000 * 2 : 0`)
          console.log(`= ${HAS_HANDRAIL} ? ${Math.sqrt(LENGTH * LENGTH + HEIGHT * HEIGHT)} / 1000 * 2 : 0`)
          console.log(`= ${result.toFixed(2)} метров`)
          console.log(`Ожидаемый результат: ~7.81 метров поручня`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSpecificFormulas()
