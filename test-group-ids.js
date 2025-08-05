// Тест для проверки группы товаров
const testGroupIds = async () => {
  try {
    console.log('🧪 Testing Group IDs...');
    
    // Загружаем группы
    const groupsResponse = await fetch('http://localhost:3005/api/product-groups');
    const groupsData = await groupsResponse.json();
    
    console.log('📋 All groups:');
    groupsData.data.forEach(group => {
      console.log(`  - ID: ${group.id}, Name: ${group.name}, Products: ${group._count.products}`);
    });
    
    // Тестируем группу Погонажные изделия
    const targetGroup = groupsData.data.find(g => g.name === 'Погонажные изделия');
    if (targetGroup) {
      console.log(`\n🎯 Target Group: ${targetGroup.name}`);
      console.log(`   ID: ${targetGroup.id}`);
      console.log(`   Products Count: ${targetGroup._count.products}`);
      
      // Тестируем API товаров
      const productsResponse = await fetch(`http://localhost:3005/api/products?groupId=${targetGroup.id}&showAll=true`);
      const productsData = await productsResponse.json();
      
      console.log(`\n📦 Products API Result:`);
      console.log(`   Status: ${productsResponse.status}`);
      console.log(`   Products returned: ${productsData.data ? productsData.data.length : 0}`);
      console.log(`   Data structure:`, productsData);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testGroupIds();
