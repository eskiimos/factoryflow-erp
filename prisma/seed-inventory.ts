import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedInventoryData() {
  console.log('🌱 Обновление данных запасов...')

  // Получаем все активные материалы
  const materials = await prisma.materialItem.findMany({
    where: { isActive: true }
  })

  for (const material of materials) {
    // Генерируем случайные, но логичные значения запасов
    const criticalMinimum = Math.floor(Math.random() * 10) + 5 // 5-15
    const satisfactoryLevel = criticalMinimum + Math.floor(Math.random() * 50) + 20 // критический + 20-70
    const currentStock = Math.floor(Math.random() * (satisfactoryLevel * 2)) // 0 до удовлетворительного * 2

    await prisma.materialItem.update({
      where: { id: material.id },
      data: {
        currentStock,
        criticalMinimum,
        satisfactoryLevel
      }
    })

    console.log(`✅ Обновлен ${material.name}: остаток ${currentStock}, критический ${criticalMinimum}, удовл. ${satisfactoryLevel}`)
  }

  console.log('🎉 Данные запасов обновлены!')
}

seedInventoryData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
