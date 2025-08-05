const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTemplateParameters() {
  try {
    const templateId = 'cmdegjp1e0000ugzj4dk1nb4x'
    
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        parameters: {
          include: {
            parameter: true
          }
        }
      }
    })

    if (!template) {
      console.log('❌ Шаблон не найден')
      return
    }

    console.log(`📋 Параметры шаблона "${template.name}":`)
    if (template.parameters) {
      template.parameters.forEach(tp => {
        console.log(`- Code: ${tp.parameter.code}, Name: ${tp.parameter.name}, Required: ${tp.isRequired}`)
      })
    } else {
      console.log('❌ Нет связанных параметров')
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTemplateParameters()
