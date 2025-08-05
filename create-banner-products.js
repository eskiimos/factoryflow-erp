const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAndCreateBannerData() {
  console.log('🗑️  Очищаем существующие товары и группы...');
  
  try {
    // Удаляем связи товаров с материалами, работами и фондами
    await prisma.productMaterialUsage.deleteMany({});
    await prisma.productWorkTypeUsage.deleteMany({});
    await prisma.productFundUsage.deleteMany({});
    
    // Удаляем все товары
    await prisma.product.deleteMany({});
    
    // Удаляем подгруппы товаров
    await prisma.productSubgroup.deleteMany({});
    
    // Удаляем группы товаров
    await prisma.productGroup.deleteMany({});
    
    console.log('✅ Все товары и группы удалены');
    
    // Создаем группу для баннерной продукции
    console.log('📝 Создаем группу "Баннерная продукция"...');
    
    const bannerGroup = await prisma.productGroup.create({
      data: {
        name: 'Баннерная продукция',
        description: 'Все виды баннеров и наружной рекламы',
        isActive: true
      }
    });
    
    console.log(`✅ Создана группа: ${bannerGroup.name}`);
    
    // Создаем подгруппы для разных типов баннеров
    const subgroups = [
      {
        name: 'Уличные баннеры',
        description: 'Баннеры для наружной рекламы и уличного размещения',
        groupId: bannerGroup.id
      },
      {
        name: 'Интерьерные баннеры',
        description: 'Баннеры для размещения внутри помещений',
        groupId: bannerGroup.id
      },
      {
        name: 'Mesh-баннеры',
        description: 'Сетчатые баннеры для ветровых нагрузок',
        groupId: bannerGroup.id
      },
      {
        name: 'Баннеры с подсветкой',
        description: 'Световые баннеры и лайтбоксы',
        groupId: bannerGroup.id
      }
    ];
    
    console.log('📝 Создаем подгруппы баннеров...');
    
    const createdSubgroups = [];
    for (const subgroup of subgroups) {
      const created = await prisma.productSubgroup.create({
        data: subgroup
      });
      createdSubgroups.push(created);
      console.log(`✅ Создана подгруппа: ${created.name}`);
    }
    
    // Создаем товары-баннеры
    console.log('📝 Создаем товары баннеры...');
    
    const bannerProducts = [
      {
        name: 'Баннер уличный стандартный',
        sku: 'BNR-001',
        description: 'Уличный баннер из баннерной ткани 440 г/м² с люверсами',
        unit: 'м²',
        baseUnit: 'м²',
        productType: 'STANDARD',
        type: 'service',
        pricingMethod: 'calculated',
        sellingPrice: 850,
        currency: 'RUB',
        productionTime: 2,
        subgroupId: createdSubgroups[0].id, // Уличные баннеры
        groupId: bannerGroup.id,
        specifications: JSON.stringify({
          material: 'Баннерная ткань 440 г/м²',
          finishing: 'Люверсы каждые 50 см',
          mounting: 'Готов к установке',
          weather_resistance: 'Морозостойкий до -30°C'
        })
      },
      {
        name: 'Баннер уличный усиленный',
        sku: 'BNR-002',
        description: 'Усиленный уличный баннер из ткани 510 г/м² для больших размеров',
        unit: 'м²',
        baseUnit: 'м²',
        productType: 'STANDARD',
        type: 'service',
        pricingMethod: 'calculated',
        sellingPrice: 950,
        currency: 'RUB',
        productionTime: 3,
        subgroupId: createdSubgroups[0].id, // Уличные баннеры
        groupId: bannerGroup.id,
        specifications: JSON.stringify({
          material: 'Баннерная ткань 510 г/м²',
          finishing: 'Люверсы каждые 40 см',
          mounting: 'Усиленное крепление',
          weather_resistance: 'Морозостойкий до -40°C'
        })
      },
      {
        name: 'Баннер интерьерный',
        sku: 'BNR-003',
        description: 'Интерьерный баннер на самоклеящейся пленке',
        unit: 'м²',
        baseUnit: 'м²',
        productType: 'STANDARD',
        type: 'service',
        pricingMethod: 'calculated',
        sellingPrice: 650,
        currency: 'RUB',
        productionTime: 1,
        subgroupId: createdSubgroups[1].id, // Интерьерные баннеры
        groupId: bannerGroup.id,
        specifications: JSON.stringify({
          material: 'Самоклеящаяся пленка белая',
          finishing: 'Готов к поклейке',
          mounting: 'Самоклеящийся',
          surface: 'Для гладких поверхностей'
        })
      },
      {
        name: 'Mesh-баннер ветрозащитный',
        sku: 'BNR-004',
        description: 'Сетчатый баннер для размещения в ветреных местах',
        unit: 'м²',
        baseUnit: 'м²',
        productType: 'STANDARD',
        type: 'service',
        pricingMethod: 'calculated',
        sellingPrice: 750,
        currency: 'RUB',
        productionTime: 2,
        subgroupId: createdSubgroups[2].id, // Mesh-баннеры
        groupId: bannerGroup.id,
        specifications: JSON.stringify({
          material: 'Сетка баннерная 230 г/м²',
          perforation: '50% прозрачности',
          finishing: 'Люверсы каждые 50 см',
          wind_resistance: 'До 25 м/с'
        })
      },
      {
        name: 'Лайтбокс с подсветкой',
        sku: 'BNR-005',
        description: 'Световой короб с LED подсветкой и акриловым рассеивателем',
        unit: 'шт',
        baseUnit: 'шт',
        productType: 'STANDARD',
        type: 'product',
        pricingMethod: 'calculated',
        sellingPrice: 15000,
        currency: 'RUB',
        productionTime: 5,
        subgroupId: createdSubgroups[3].id, // Баннеры с подсветкой
        groupId: bannerGroup.id,
        specifications: JSON.stringify({
          frame: 'Алюминиевый профиль 20x20',
          diffuser: 'Акрил молочный 3мм',
          lighting: 'LED лента 12V белая',
          power: 'Блок питания 12V 100W',
          mounting: 'Настенное крепление'
        })
      }
    ];
    
    const createdProducts = [];
    for (const product of bannerProducts) {
      const created = await prisma.product.create({
        data: product
      });
      createdProducts.push(created);
      console.log(`✅ Создан товар: ${created.name} - ${created.sellingPrice} ${created.currency}/${created.unit}`);
    }
    
    console.log('\n🎉 Успешно создана структура для баннерной продукции:');
    console.log(`📁 Группа: ${bannerGroup.name}`);
    console.log(`📂 Подгрупп: ${createdSubgroups.length}`);
    console.log(`📦 Товаров: ${createdProducts.length}`);
    
    // Показываем статистику
    console.log('\n📊 Созданные товары:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.sellingPrice} ₽/${product.unit}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    throw error;
  }
}

clearAndCreateBannerData()
  .catch((e) => {
    console.error('Ошибка выполнения скрипта:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
