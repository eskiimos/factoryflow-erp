const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearWorkTypes() {
  try {
    console.log('🗑️ Удаляем все виды работ и отделы...')
    
    // Сначала удаляем связи видов работ с продуктами
    const deletedWorkTypeUsages = await prisma.productWorkTypeUsage.deleteMany({})
    console.log(`✅ Удалено ${deletedWorkTypeUsages.count} связей видов работ с продуктами`)
    
    // Затем удаляем сотрудников (если есть)
    const deletedEmployees = await prisma.employee.deleteMany({})
    console.log(`✅ Удалено ${deletedEmployees.count} сотрудников`)
    
    // Удаляем виды работ
    const deletedWorkTypes = await prisma.workType.deleteMany({})
    console.log(`✅ Удалено ${deletedWorkTypes.count} видов работ`)
    
    // Удаляем отделы/департаменты
    const deletedDepartments = await prisma.department.deleteMany({})
    console.log(`✅ Удалено ${deletedDepartments.count} отделов`)
    
    console.log('🎉 Все виды работ, отделы и связанные данные успешно удалены!')
    
  } catch (error) {
    console.error('❌ Ошибка при удалении видов работ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearWorkTypes()
