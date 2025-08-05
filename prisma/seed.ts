import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начинаю наполнение базы данных...")

  // Создаем категории
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Металлы",
        description: "Металлические материалы и сплавы",
      },
    }),
    prisma.category.create({
      data: {
        name: "Пластики",
        description: "Полимерные материалы и пластмассы",
      },
    }),
    prisma.category.create({
      data: {
        name: "Композиты",
        description: "Композитные и армированные материалы",
      },
    }),
    prisma.category.create({
      data: {
        name: "Химикаты",
        description: "Химические реактивы и вещества",
      },
    }),
    prisma.category.create({
      data: {
        name: "Крепеж",
        description: "Болты, гайки, шайбы и прочий крепеж",
      },
    }),
  ])

  console.log(`✅ Создано ${categories.length} категорий`)

  // Создаем материалы
  const materials = [
    // Металлы
    { name: "Сталь углеродистая Ст3", unit: "кг", price: 85.50, categoryId: categories[0].id },
    { name: "Алюминий АД31", unit: "кг", price: 245.00, categoryId: categories[0].id },
    { name: "Медь М1", unit: "кг", price: 890.00, categoryId: categories[0].id },
    { name: "Латунь Л63", unit: "кг", price: 520.00, categoryId: categories[0].id },
    { name: "Нержавеющая сталь 12Х18Н10Т", unit: "кг", price: 320.00, categoryId: categories[0].id },
    
    // Пластики
    { name: "Полиэтилен ПЭ-100", unit: "кг", price: 125.00, categoryId: categories[1].id },
    { name: "Полипропилен ПП", unit: "кг", price: 110.00, categoryId: categories[1].id },
    { name: "ПВХ жесткий", unit: "кг", price: 95.00, categoryId: categories[1].id },
    { name: "Поликарбонат", unit: "кг", price: 450.00, categoryId: categories[1].id },
    { name: "ПТФЭ (Тефлон)", unit: "кг", price: 1250.00, categoryId: categories[1].id },
    
    // Композиты
    { name: "Стеклопластик", unit: "м²", price: 2800.00, categoryId: categories[2].id },
    { name: "Углепластик", unit: "м²", price: 8500.00, categoryId: categories[2].id },
    { name: "Стеклотекстолит", unit: "кг", price: 380.00, categoryId: categories[2].id },
    
    // Химикаты
    { name: "Ацетон технический", unit: "л", price: 125.00, categoryId: categories[3].id },
    { name: "Толуол", unit: "л", price: 150.00, categoryId: categories[3].id },
    { name: "Эпоксидная смола ЭД-20", unit: "кг", price: 320.00, categoryId: categories[3].id },
    { name: "Отвердитель ПЭПА", unit: "кг", price: 280.00, categoryId: categories[3].id },
    
    // Крепеж
    { name: "Болт М8х40 DIN 933", unit: "шт", price: 12.50, categoryId: categories[4].id },
    { name: "Гайка М8 DIN 934", unit: "шт", price: 4.20, categoryId: categories[4].id },
    { name: "Шайба 8 DIN 125", unit: "шт", price: 1.80, categoryId: categories[4].id },
    { name: "Винт М6х20 DIN 84", unit: "шт", price: 8.70, categoryId: categories[4].id },
  ]

  const createdMaterials = await Promise.all(
    materials.map((material) =>
      prisma.materialItem.create({
        data: {
          ...material,
          tags: JSON.stringify(["производство", "склад"]),
        },
      })
    )
  )

  console.log(`✅ Создано ${createdMaterials.length} материалов`)
  console.log("🎉 Наполнение базы данных завершено!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Ошибка при наполнении базы:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
