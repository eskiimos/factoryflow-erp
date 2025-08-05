const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMoreProducts() {
  try {
    // Получаем существующие группы и подгруппы
    const groups = await prisma.productGroup.findMany({
      where: { isActive: true },
      include: { subgroups: true }
    });

    console.log('Found groups:', groups.length);

    const products = [
      {
        name: 'Световая вывеска LED',
        description: 'Световая вывеска с LED подсветкой',
        unit: 'м²',
        basePrice: 15000,
        type: 'PRODUCT'
      },
      {
        name: 'Баннер виниловый',
        description: 'Баннер из винилового материала для наружной рекламы',
        unit: 'м²',
        basePrice: 800,
        type: 'PRODUCT'
      },
      {
        name: 'Информационный стенд',
        description: 'Стенд для размещения информации в офисе',
        unit: 'шт',
        basePrice: 5000,
        type: 'PRODUCT'
      },
      {
        name: 'Табличка офисная',
        description: 'Табличка с названием кабинета',
        unit: 'шт',
        basePrice: 1200,
        type: 'PRODUCT'
      },
      {
        name: 'Визитки премиум',
        description: 'Визитные карточки на дизайнерской бумаге',
        unit: 'шт',
        basePrice: 15,
        type: 'PRODUCT'
      }
    ];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const group = groups[i % groups.length];
      const subgroup = group.subgroups[0] || null;

      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);

      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          sku: `PRD-${timestamp}-${random}`,
          unit: product.unit,
          basePrice: product.basePrice,
          sellingPrice: product.basePrice * 1.3, // 30% markup
          groupId: group.id,
          subgroupId: subgroup?.id,
          type: product.type,
          pricingMethod: 'FIXED',
          isActive: true,
          currentStock: Math.floor(Math.random() * 100),
          minStock: 5,
          maxStock: 200
        }
      });

      console.log(`Created product: ${product.name}`);
    }

    console.log('All products created successfully');
    
  } catch (error) {
    console.error('Error creating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMoreProducts();
