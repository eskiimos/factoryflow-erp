// Полный тест UI flow
const fullUITest = async () => {
  console.log('🧪 Full UI Test - Loading groups and simulating interaction...');
  
  try {
    // 1. Симулируем загрузку групп (как в useEffect)
    console.log('📋 Step 1: Loading groups...');
    const groupsResponse = await fetch('http://localhost:3005/api/product-groups');
    const groupsData = await groupsResponse.json();
    const groups = groupsData.data;
    console.log(`✅ Loaded ${groups.length} groups`);
    
    // 2. Симулируем состояние React
    const expandedGroups = new Set();
    const groupProducts = {};
    const loadingProducts = new Set();
    
    // 3. Находим группу "Погонажные изделия"
    const targetGroup = groups.find(g => g.name === 'Погонажные изделия');
    if (!targetGroup) {
      console.error('❌ Target group not found');
      return;
    }
    
    console.log(`📂 Step 2: Found target group: ${targetGroup.name} (ID: ${targetGroup.id})`);
    
    // 4. Симулируем клик (toggleGroupExpansion)
    console.log('🔄 Step 3: Simulating group expansion click...');
    const groupId = targetGroup.id;
    const isSubgroup = false;
    
    console.log('🔄 Toggle group expansion:', { groupId, isSubgroup });
    
    if (!expandedGroups.has(groupId)) {
      expandedGroups.add(groupId);
      console.log('📥 Expanding group:', groupId);
      
      // 5. Симулируем fetchGroupProducts (так как товары не кэшированы)
      if (!groupProducts[groupId]) {
        console.log('🛒 No products cached, fetching...');
        
        // Симулируем setLoadingProducts
        loadingProducts.add(groupId);
        console.log('⏳ Loading state added for:', groupId);
        
        const param = isSubgroup ? 'subgroupId' : 'groupId';
        const url = `http://localhost:3005/api/products?${param}=${groupId}&showAll=true`;
        
        console.log('🌐 Fetching from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('❌ Failed to fetch products');
          return;
        }
        
        const data = await response.json();
        const products = data.data || data.products || [];
        
        console.log(`✅ Loaded ${products.length} products for group ${groupId}`);
        
        // Симулируем setGroupProducts
        groupProducts[groupId] = products;
        console.log(`📊 Updated groupProducts state for ${groupId}:`, groupProducts[groupId]?.length, 'products');
        
        // Симулируем удаление из loading
        loadingProducts.delete(groupId);
        console.log('✅ Loading state removed for:', groupId);
      }
    }
    
    // 6. Симулируем условия рендеринга
    console.log('\n🎯 Step 4: Checking render conditions...');
    const isExpanded = expandedGroups.has(groupId);
    console.log('🎯 Is expanded:', isExpanded);
    
    if (isExpanded) {
      const isLoading = loadingProducts.has(groupId);
      const hasProducts = groupProducts[groupId] && groupProducts[groupId].length > 0;
      const isEmpty = groupProducts[groupId] && groupProducts[groupId].length === 0;
      
      console.log('🔍 Render conditions:');
      console.log('   - isLoading:', isLoading);
      console.log('   - hasProducts:', hasProducts);
      console.log('   - isEmpty:', isEmpty);
      console.log('   - groupProducts[groupId]:', groupProducts[groupId]?.length || 'undefined');
      
      if (isLoading) {
        console.log('⏳ Should show: Loading spinner');
      } else if (hasProducts) {
        console.log(`🎉 Should show: ${groupProducts[groupId].length} products`);
        console.log('📦 First few products:');
        groupProducts[groupId].slice(0, 3).forEach((product, i) => {
          console.log(`   ${i + 1}. ${product.name} (${product.sku})`);
        });
      } else if (isEmpty) {
        console.log('📭 Should show: "Товаров в группе нет"');
      } else {
        console.log('❓ Should show: Nothing (no products loaded yet)');
      }
    } else {
      console.log('📁 Group is not expanded, no products should show');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

fullUITest();
