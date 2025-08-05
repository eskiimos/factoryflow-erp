const { PrismaClient } = require('@prisma/client');

async function createTestProducts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Проверяем существующие товары...');
    
    // Проверим, есть ли уже сборный товар
    const existingAssembly = await prisma.product.findFirst({
      where: { productType: 'ASSEMBLY' }
    });
    
    const existingWarehouse = await prisma.product.findFirst({
      where: { productType: 'WAREHOUSE' }
    });
    
    if (!existingWarehouse) {
      // Создаем складской товар
      const warehouseProduct = await prisma.product.create({
        data: {
          name: 'Тестовый складской товар',
          description: 'Товар со склада с фиксированной стоимостью',
          sku: 'WAREHOUSE-001',
          unit: 'шт',
          productType: 'WAREHOUSE',
          basePrice: 75,
          materialCost: 0,
          laborCost: 0,
          overheadCost: 0,
          totalCost: 75,
          sellingPrice: 100,
          margin: 25,
          currency: 'RUB',
          productionTime: 0,
          currentStock: 25,
          minStock: 10,
          maxStock: 100,
          isActive: true
        }
      });
      
      console.log(`Создан складской товар: ${warehouseProduct.name} (${warehouseProduct.id})`);
    } else {
      console.log('Складской товар уже существует');
    }
    
    if (!existingAssembly) {
      // Найдем товары для компонентов
      const standardProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          productType: 'STANDARD'
        },
        take: 2
      });
      
      if (standardProducts.length >= 2) {
        // Создаем сборный товар с уникальным SKU
        const uniqueSku = `ASSEMBLY-${Date.now()}`;
        const assemblyProduct = await prisma.product.create({
          data: {
            name: 'Тестовый сборный товар',
            description: 'Сборный товар из компонентов',
            sku: uniqueSku,
            unit: 'шт',
            productType: 'ASSEMBLY',
            basePrice: 0,
            materialCost: 0,
            laborCost: 0,
            overheadCost: 0,
            totalCost: 150,
            sellingPrice: 200,
            margin: 25,
            currency: 'RUB',
            productionTime: 60,
            currentStock: 0,
            minStock: 5,
            maxStock: 50,
            isActive: true
          }
        });
        
        console.log(`Создан сборный товар: ${assemblyProduct.name} (${assemblyProduct.id})`);
        
        // Добавляем компоненты
        const components = [
          {
            parentProductId: assemblyProduct.id,
            componentProductId: standardProducts[0].id,
            quantity: 2,
            cost: standardProducts[0].sellingPrice || 50
          },
          {
            parentProductId: assemblyProduct.id,
            componentProductId: standardProducts[1].id,
            quantity: 1,
            cost: standardProducts[1].sellingPrice || 50
          }
        ];
        
        for (const component of components) {
          const createdComponent = await prisma.assemblyComponent.create({
            data: component
          });
          console.log(`Добавлен компонент: ${component.quantity}x товар ${component.componentProductId}`);
        }
      } else {
        console.log('Недостаточно стандартных товаров для создания сборного товара');
      }
    } else {
      console.log('Сборный товар уже существует');
    }
    
    // Выводим финальную статистику
    const typeCounts = await prisma.product.groupBy({
      by: ['productType'],
      _count: {
        id: true
      }
    });
    
    console.log('\nСтатистика по типам товаров:');
    typeCounts.forEach(({ productType, _count }) => {
      console.log(`- ${productType}: ${_count.id} товаров`);
    });
    
  } catch (error) {
    console.error('Ошибка при создании товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProducts();
