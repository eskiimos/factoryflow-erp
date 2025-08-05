const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        groupId: true,
        subgroupId: true,
        group: { select: { name: true } },
        subgroup: { select: { name: true } }
      }
    });

    console.log('Found products:', products.length);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.sku}) - Group: ${product.group?.name}, Subgroup: ${product.subgroup?.name}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

listProducts();
