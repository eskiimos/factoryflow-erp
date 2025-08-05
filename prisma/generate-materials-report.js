const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  try {
    console.log("📊 Генерация отчета по материалам...");
    
    // Получаем все категории с материалами
    const categories = await prisma.category.findMany({
      include: {
        materialItems: true
      },
      where: {
        isActive: true
      }
    });
    
    let report = "# Отчет по материалам\n\n";
    report += `Сгенерировано: ${new Date().toLocaleString('ru-RU')}\n\n`;
    
    let totalMaterials = 0;
    
    for (const category of categories) {
      report += `## ${category.name} (${category.materialItems.length})\n\n`;
      report += "| Название | Единица | Цена (₽) | Метки |\n";
      report += "|----------|---------|----------|-------|\n";
      
      const sortedMaterials = category.materialItems
        .filter(item => item.isActive)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      for (const material of sortedMaterials) {
        const tags = material.tags ? JSON.parse(material.tags) : [];
        report += `| ${material.name} | ${material.unit} | ${material.price.toFixed(2)} | ${tags.join(", ")} |\n`;
      }
      
      report += "\n";
      totalMaterials += sortedMaterials.length;
    }
    
    report += `## Общая статистика\n\n`;
    report += `- Всего категорий: ${categories.length}\n`;
    report += `- Всего активных материалов: ${totalMaterials}\n`;
    
    // Сохраняем отчет
    const reportPath = 'materials-report.md';
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Отчет сохранен в файл ${reportPath}`);
    
  } catch (error) {
    console.error("❌ Ошибка при генерации отчета:", error);
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
