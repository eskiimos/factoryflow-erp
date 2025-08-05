import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("🗑️ Удаление всех существующих материалов...")
    
    // Удаляем все материалы
    const deletedMaterials = await prisma.materialItem.deleteMany()
    console.log(`✅ Удалено ${deletedMaterials.count} материалов`)
    
    console.log("🌱 Запуск seed скрипта для пересоздания материалов...")
    
    // Запускаем seed скрипт
    await execAsync("npx prisma db seed")
    
    console.log("🎉 Материалы успешно пересозданы!")
  } catch (error) {
    console.error("❌ Ошибка при сбросе материалов:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
