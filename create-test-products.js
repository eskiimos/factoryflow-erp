const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Создание тестовых продуктов...');
    
    // Получаем существующие категории
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('Категории не найдены. Создаю базовую категорию.');
      const defaultCategory = await prisma.category.create({
        data: {
          name: "Основная",
          description: "Основная категория товаров",
        }
      });
      categories.push(defaultCategory);
    }
    
    // Получаем существующие группы или создаем новую
    let groups = await prisma.productGroup.findMany();
    if (groups.length === 0) {
      console.log('Группы продуктов не найдены. Создаю базовую группу.');
      const defaultGroup = await prisma.productGroup.create({
        data: {
          name: "Основная",
          description: "Основная группа товаров",
        }
      });
      groups.push(defaultGroup);
    }
    
    // Создаем тестовые материалы если их нет
    const materials = await prisma.materialItem.findMany({ take: 5 });
    if (materials.length === 0) {
      console.log('Материалы не найдены. Создаю тестовые материалы.');
      const testMaterials = await Promise.all([
        prisma.materialItem.create({
          data: {
            name: "Сталь листовая",
            unit: "кг",
            price: 85.0,
            currency: "RUB",
            categoryId: categories[0].id
          }
        }),
        prisma.materialItem.create({
          data: {
            name: "Алюминий",
            unit: "кг",
            price: 270.0,
            currency: "RUB",
            categoryId: categories[0].id
          }
        }),
        prisma.materialItem.create({
          data: {
            name: "Краска акриловая",
            unit: "л",
            price: 350.0,
            currency: "RUB",
            categoryId: categories[0].id
          }
        })
      ]);
      materials.push(...testMaterials);
    }
    
    // Создаем тестовые работы если их нет
    const workTypes = await prisma.workType.findMany({ take: 5 });
    if (workTypes.length === 0) {
      console.log('Типы работ не найдены. Создаю тестовые типы работ.');
      
      // Создаем отделы
      const department = await prisma.department.create({
        data: {
          name: "Производство",
          description: "Производственный отдел"
        }
      });
      
      const testWorkTypes = await Promise.all([
        prisma.workType.create({
          data: {
            name: "Резка",
            description: "Резка материалов",
            hourlyRate: 800,
            departmentId: department.id
          }
        }),
        prisma.workType.create({
          data: {
            name: "Сборка",
            description: "Сборка изделия",
            hourlyRate: 1000,
            departmentId: department.id
          }
        }),
        prisma.workType.create({
          data: {
            name: "Покраска",
            description: "Покраска изделия",
            hourlyRate: 900,
            departmentId: department.id
          }
        })
      ]);
      workTypes.push(...testWorkTypes);
    }
    
    // Создаем тестовые продукты
    const productNames = [
      "Стул офисный",
      "Стол рабочий",
      "Шкаф для документов",
      "Полка настенная",
      "Кресло для отдыха",
      "Тумба выкатная",
      "Вешалка напольная",
      "Столешница из ЛДСП"
    ];
    
    for (const name of productNames) {
      const existingProduct = await prisma.product.findFirst({
        where: { name }
      });
      
      if (!existingProduct) {
        // Расчет случайных стоимостей
        const materialCost = Math.round(Math.random() * 5000 + 1000);
        const laborCost = Math.round(Math.random() * 3000 + 500);
        const overheadCost = Math.round(materialCost * 0.2);
        const totalCost = materialCost + laborCost + overheadCost;
        const margin = Math.round(Math.random() * 30 + 20); // 20-50%
        const sellingPrice = Math.round(totalCost * (1 + margin / 100));
        
        // Создаем продукт
        const product = await prisma.product.create({
          data: {
            name,
            description: `${name} - качественный товар для вашего бизнеса`,
            sku: `SKU-${Math.floor(Math.random() * 10000)}`,
            unit: "шт",
            materialCost,
            laborCost,
            overheadCost,
            totalCost,
            sellingPrice,
            margin,
            productionTime: Math.round(Math.random() * 8 + 2), // 2-10 часов
            currentStock: Math.floor(Math.random() * 20),
            minStock: 5,
            maxStock: 30,
            isActive: true,
            group: {
              connect: { id: groups[0].id }
            },
            // У продуктов нет categoryId, только у материалов
            // categoryId: categories[0].id,
          }
        });
        
        console.log(`Создан продукт: ${product.name}`);
        
        // Добавляем использование материалов
        const materialCount = Math.floor(Math.random() * 3) + 1; // 1-3 материала
        for (let i = 0; i < materialCount && i < materials.length; i++) {
          await prisma.productMaterialUsage.create({
            data: {
              productId: product.id,
              materialItemId: materials[i].id,
              quantity: Math.round(Math.random() * 5 + 0.5), // 0.5-5.5
              cost: Math.round(Math.random() * 1000 + 200),
              unitType: 'fixed',
            }
          });
        }
        
        // Добавляем типы работ
        const workCount = Math.floor(Math.random() * 3) + 1; // 1-3 типа работ
        for (let i = 0; i < workCount && i < workTypes.length; i++) {
          await prisma.productWorkTypeUsage.create({
            data: {
              productId: product.id,
              workTypeId: workTypes[i].id,
              quantity: Math.round(Math.random() * 3 + 0.5), // 0.5-3.5 часов
              cost: Math.round(Math.random() * 800 + 200),
              sequence: i + 1,
              unitType: 'fixed',
            }
          });
        }
      }
    }
    
    console.log('Тестовые продукты успешно созданы!');
  } catch (error) {
    console.error('Ошибка при создании тестовых продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
