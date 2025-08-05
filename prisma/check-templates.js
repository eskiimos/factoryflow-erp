const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTemplates() {
  try {
    const templates = await prisma.template.findMany()
    console.log('📋 Шаблоны в базе данных:')
    templates.forEach(template => {
      console.log(`ID: ${template.id}, Name: ${template.name}`)
    })
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTemplates()
