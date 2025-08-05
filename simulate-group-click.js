// Симуляция клика на группу "Погонажные изделия"
const simulateGroupExpansion = async () => {
  console.log('🧪 Simulating group expansion for "Погонажные изделия"...');
  
  // 1. Загружаем группы как это делает UI
  const groupsResponse = await fetch('http://localhost:3005/api/product-groups');
  const groupsData = await groupsResponse.json();
  const groups = groupsData.data;
  
  // 2. Находим группу "Погонажные изделия"
  const targetGroup = groups.find(g => g.name === 'Погонажные изделия');
  if (!targetGroup) {
    console.error('❌ Group "Погонажные изделия" not found!');
    return;
  }
  
  console.log('📂 Found target group:', {
    id: targetGroup.id,
    name: targetGroup.name,
    productsCount: targetGroup._count.products
  });
  
  // 3. Симулируем toggleGroupExpansion
  const groupId = targetGroup.id;
  const isSubgroup = false;
  
  console.log('🔄 Toggle group expansion:', { groupId, isSubgroup });
  
  // 4. Симулируем fetchGroupProducts (так как товары не кэшированы)
  console.log('🛒 Fetching products for:', { groupId, isSubgroup });
  
  const param = isSubgroup ? 'subgroupId' : 'groupId';
  const url = `http://localhost:3005/api/products?${param}=${groupId}&showAll=true`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch products');
    return;
  }
  
  const data = await response.json();
  const products = data.data || data.products || [];
  
  console.log(`✅ Loaded ${products.length} products for group ${groupId}`);
  
  // 5. Симулируем состояние groupProducts
  const groupProducts = {
    [groupId]: products
  };
  
  console.log(`📊 Simulated groupProducts state:`, groupProducts);
  console.log(`📊 Specifically for group ${groupId}:`, groupProducts[groupId]);
  
  // 6. Симулируем условие рендеринга
  const hasProducts = groupProducts[groupId] && groupProducts[groupId].length > 0;
  const isEmpty = groupProducts[groupId] && groupProducts[groupId].length === 0;
  
  console.log(`🎯 Rendering conditions:`);
  console.log(`   - hasProducts: ${hasProducts}`);
  console.log(`   - isEmpty: ${isEmpty}`);
  console.log(`   - should show products: ${hasProducts}`);
  console.log(`   - should show "no products": ${isEmpty}`);
  
  if (hasProducts) {
    console.log(`🎉 SUCCESS: Should display ${products.length} products`);
    products.slice(0, 3).forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name} (${product.sku})`);
    });
    if (products.length > 3) {
      console.log(`   ... and ${products.length - 3} more products`);
    }
  } else if (isEmpty) {
    console.log(`📭 Would show "Товаров в группе нет"`);
  } else {
    console.log(`⏳ Products not loaded yet or loading`);
  }
};

simulateGroupExpansion().catch(console.error);
