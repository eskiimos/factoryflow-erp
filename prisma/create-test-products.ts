import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestProducts() {
  try {
    // Get existing groups
    const signageGroup = await prisma.productGroup.findFirst({
      where: { name: 'Наружная реклама' },
      include: { subgroups: true }
    });

    const interiorGroup = await prisma.productGroup.findFirst({
      where: { name: 'Интерьерная реклама' },
      include: { subgroups: true }
    });

    if (!signageGroup || !interiorGroup) {
      throw new Error('Required product groups not found');
    }

    const timestamp = Date.now();

    // Create a test product in each subgroup
    for (const subgroup of signageGroup.subgroups) {
      const productName = `Тест ${subgroup.name}`;
      
      await prisma.product.create({
        data: {
          name: productName,
          description: `Тестовый образец ${subgroup.name.toLowerCase()}`,
          sku: `TEST-${subgroup.id.slice(0, 8)}-${timestamp}-${Math.floor(Math.random() * 1000)}`,
          unit: 'шт',
          basePrice: 1000,
          groupId: signageGroup.id,
          subgroupId: subgroup.id,
          type: 'PRODUCT',
          pricingMethod: 'FIXED',
          isActive: true
        }
      });
    }

    for (const subgroup of interiorGroup.subgroups) {
      const productName = `Тест ${subgroup.name}`;
      
      await prisma.product.create({
        data: {
          name: productName,
          description: `Тестовый образец ${subgroup.name.toLowerCase()}`,
          sku: `TEST-${subgroup.id.slice(0, 8)}-${timestamp}-${Math.floor(Math.random() * 1000)}`,
          unit: 'шт',
          basePrice: 500,
          groupId: interiorGroup.id,
          subgroupId: subgroup.id,
          type: 'PRODUCT',
          pricingMethod: 'FIXED',
          isActive: true
        }
      });
    }

    console.log('Test products created successfully');

  } catch (error) {
    console.error('Error creating test products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProducts();
