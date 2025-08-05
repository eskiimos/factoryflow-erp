const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearMaterials() {
  try {
    console.log('🗑️ Удаляем все материалы и категории...')
    
    // Сначала удаляем связи с продуктами
    const deletedUsages = await prisma.productMaterialUsage.deleteMany({})
    console.log(`✅ Удалено ${deletedUsages.count} связей материалов с продуктами`)
    
    // Затем удаляем сами материалы
    const deletedMaterials = await prisma.materialItem.deleteMany({})
    console.log(`✅ Удалено ${deletedMaterials.count} материалов`)
    
    // Удаляем категории материалов
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`✅ Удалено ${deletedCategories.count} категорий`)
    
    console.log('🎉 Все материалы и категории успешно удалены!')
    
  } catch (error) {
    console.error('❌ Ошибка при удалении материалов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearMaterials()
