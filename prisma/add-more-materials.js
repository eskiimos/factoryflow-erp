const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Получение категорий...");
    const categories = await prisma.category.findMany();
    
    if (categories.length === 0) {
      throw new Error("Категории не найдены. Сначала запустите reset-materials.js");
    }

    // Находим категории по имени
    const metals = categories.find(c => c.name === "Металлы");
    const plastics = categories.find(c => c.name === "Пластики");
    const composites = categories.find(c => c.name === "Композиты");
    const chemicals = categories.find(c => c.name === "Химикаты");
    const fasteners = categories.find(c => c.name === "Крепеж");

    console.log("📦 Добавление дополнительных материалов...");

    // Добавляем дополнительные металлы
    console.log("➕ Добавление дополнительных металлов...");
    const additionalMetals = [
      { name: "Титан ВТ1-0", unit: "кг", price: 2800.00, categoryId: metals.id },
      { name: "Бронза БрАЖ9-4", unit: "кг", price: 780.00, categoryId: metals.id },
      { name: "Чугун СЧ20", unit: "кг", price: 95.00, categoryId: metals.id },
    ];

    await Promise.all(
      additionalMetals.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "металлы", "дорогие"]),
          },
        })
      )
    );

    // Добавляем дополнительные пластики
    console.log("➕ Добавление дополнительных пластиков...");
    const additionalPlastics = [
      { name: "АБС-пластик", unit: "кг", price: 280.00, categoryId: plastics.id },
      { name: "Нейлон PA6", unit: "кг", price: 350.00, categoryId: plastics.id },
      { name: "Полиуретан", unit: "кг", price: 420.00, categoryId: plastics.id },
    ];

    await Promise.all(
      additionalPlastics.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "пластики"]),
          },
        })
      )
    );

    // Добавляем дополнительные композиты
    console.log("➕ Добавление дополнительных композитов...");
    const additionalComposites = [
      { name: "Кевлар", unit: "м²", price: 12000.00, categoryId: composites.id },
      { name: "Арамидная ткань", unit: "м²", price: 4500.00, categoryId: composites.id },
    ];

    await Promise.all(
      additionalComposites.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "композиты", "армирование"]),
          },
        })
      )
    );

    // Добавляем дополнительные химикаты
    console.log("➕ Добавление дополнительных химикатов...");
    const additionalChemicals = [
      { name: "Спирт изопропиловый", unit: "л", price: 180.00, categoryId: chemicals.id },
      { name: "Клей цианакрилатный", unit: "мл", price: 12.00, categoryId: chemicals.id },
      { name: "Силиконовый герметик", unit: "шт", price: 320.00, categoryId: chemicals.id },
    ];

    await Promise.all(
      additionalChemicals.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "химикаты", "расходники"]),
          },
        })
      )
    );

    // Добавляем дополнительный крепеж
    console.log("➕ Добавление дополнительного крепежа...");
    const additionalFasteners = [
      { name: "Саморезы по металлу 4.2x19", unit: "шт", price: 1.20, categoryId: fasteners.id },
      { name: "Дюбель-гвозди 6x60", unit: "шт", price: 2.50, categoryId: fasteners.id },
      { name: "Анкерный болт 10x100", unit: "шт", price: 18.50, categoryId: fasteners.id },
    ];

    await Promise.all(
      additionalFasteners.map(material =>
        prisma.materialItem.create({
          data: {
            ...material,
            tags: JSON.stringify(["производство", "склад", "крепеж", "монтаж"]),
          },
        })
      )
    );

    console.log("🎉 Дополнительные материалы успешно добавлены!");
    console.log("📊 Всего добавлено: " + (
      additionalMetals.length + 
      additionalPlastics.length + 
      additionalComposites.length + 
      additionalChemicals.length + 
      additionalFasteners.length
    ) + " материалов");
    
  } catch (error) {
    console.error("❌ Ошибка при добавлении материалов:", error);
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
