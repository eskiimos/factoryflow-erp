const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🗑️ Удаление всех существующих материалов...");
    
    // Удаляем все материалы
    const deletedMaterials = await prisma.materialItem.deleteMany();
    console.log(`✅ Удалено ${deletedMaterials.count} материалов`);
    
    console.log("🌱 Создание новых категорий и материалов...");

    // Создаем категории
    console.log("📁 Создание категорий...");
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: "Металлы" },
        update: { description: "Металлические материалы и сплавы" },
        create: { name: "Металлы", description: "Металлические материалы и сплавы" },
      }),
      prisma.category.upsert({
        where: { name: "Пластики" },
        update: { description: "Полимерные материалы и пластмассы" },
        create: { name: "Пластики", description: "Полимерные материалы и пластмассы" },
      }),
      prisma.category.upsert({
        where: { name: "Композиты" },
        update: { description: "Композитные и армированные материалы" },
        create: { name: "Композиты", description: "Композитные и армированные материалы" },
      }),
      prisma.category.upsert({
        where: { name: "Химикаты" },
        update: { description: "Химические реактивы и вещества" },
        create: { name: "Химикаты", description: "Химические реактивы и вещества" },
      }),
      prisma.category.upsert({
        where: { name: "Крепеж" },
        update: { description: "Болты, гайки, шайбы и прочий крепеж" },
        create: { name: "Крепеж", description: "Болты, гайки, шайбы и прочий крепеж" },
      }),
    ]);

    console.log(`✅ Создано/обновлено ${categories.length} категорий`);

    // Создаем материалы для каждой категории
    console.log("📦 Создание материалов для категории 'Металлы'...");
    const metals = [
      { name: "Сталь углеродистая Ст3", unit: "кг", price: 85.50, categoryId: categories[0].id },
      { name: "Алюминий АД31", unit: "кг", price: 245.00, categoryId: categories[0].id },
      { name: "Медь М1", unit: "кг", price: 890.00, categoryId: categories[0].id },
      { name: "Латунь Л63", unit: "кг", price: 520.00, categoryId: categories[0].id },
      { name: "Нержавеющая сталь 12Х18Н10Т", unit: "кг", price: 320.00, categoryId: categories[0].id },
    ];

    const createdMetals = await Promise.all(
      metals.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "металлы"]),
          },
        })
      )
    );
    console.log(`✅ Создано ${createdMetals.length} металлов`);

    console.log("📦 Создание материалов для категории 'Пластики'...");
    const plastics = [
      { name: "Полиэтилен ПЭ-100", unit: "кг", price: 125.00, categoryId: categories[1].id },
      { name: "Полипропилен ПП", unit: "кг", price: 110.00, categoryId: categories[1].id },
      { name: "ПВХ жесткий", unit: "кг", price: 95.00, categoryId: categories[1].id },
      { name: "Поликарбонат", unit: "кг", price: 450.00, categoryId: categories[1].id },
      { name: "ПТФЭ (Тефлон)", unit: "кг", price: 1250.00, categoryId: categories[1].id },
    ];

    const createdPlastics = await Promise.all(
      plastics.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "пластики"]),
          },
        })
      )
    );
    console.log(`✅ Создано ${createdPlastics.length} пластиков`);

    console.log("📦 Создание материалов для категории 'Композиты'...");
    const composites = [
      { name: "Стеклопластик", unit: "м²", price: 2800.00, categoryId: categories[2].id },
      { name: "Углепластик", unit: "м²", price: 8500.00, categoryId: categories[2].id },
      { name: "Стеклотекстолит", unit: "кг", price: 380.00, categoryId: categories[2].id },
    ];

    const createdComposites = await Promise.all(
      composites.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "композиты"]),
          },
        })
      )
    );
    console.log(`✅ Создано ${createdComposites.length} композитов`);

    console.log("📦 Создание материалов для категории 'Химикаты'...");
    const chemicals = [
      { name: "Ацетон технический", unit: "л", price: 125.00, categoryId: categories[3].id },
      { name: "Толуол", unit: "л", price: 150.00, categoryId: categories[3].id },
      { name: "Эпоксидная смола ЭД-20", unit: "кг", price: 320.00, categoryId: categories[3].id },
      { name: "Отвердитель ПЭПА", unit: "кг", price: 280.00, categoryId: categories[3].id },
    ];

    const createdChemicals = await Promise.all(
      chemicals.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "химикаты"]),
          },
        })
      )
    );
    console.log(`✅ Создано ${createdChemicals.length} химикатов`);

    console.log("📦 Создание материалов для категории 'Крепеж'...");
    const fasteners = [
      { name: "Болт М8х40 DIN 933", unit: "шт", price: 12.50, categoryId: categories[4].id },
      { name: "Гайка М8 DIN 934", unit: "шт", price: 4.20, categoryId: categories[4].id },
      { name: "Шайба 8 DIN 125", unit: "шт", price: 1.80, categoryId: categories[4].id },
      { name: "Винт М6х20 DIN 84", unit: "шт", price: 8.70, categoryId: categories[4].id },
    ];

    const createdFasteners = await Promise.all(
      fasteners.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "крепеж"]),
          },
        })
      )
    );
    console.log(`✅ Создано ${createdFasteners.length} элементов крепежа`);

    const totalCreated = createdMetals.length + createdPlastics.length + createdComposites.length + 
                         createdChemicals.length + createdFasteners.length;
    
    console.log(`🎉 Всего создано ${totalCreated} материалов для ${categories.length} категорий!`);
  } catch (error) {
    console.error("❌ Ошибка при сбросе материалов:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
