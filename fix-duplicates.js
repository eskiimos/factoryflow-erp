const fs = require('fs');

// Список файлов для исправления дубликатов
const filesToFix = [
  'src/app/api/departments/[id]/route.ts',
  'src/app/api/employees/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/orders/[id]/items/route.ts',
  'src/app/api/orders/calculator/[id]/recalculate/route.ts',
  'src/app/api/fund-items/[id]/route.ts',
  'src/app/api/budget-plans/[id]/route.ts'
];

function removeDuplicates(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Удаление дублированных строк const { id } = await params;
    content = content.replace(
      /(const\s*\{\s*id\s*\}\s*=\s*await\s*params;\s*\n\s*const\s*\{\s*id\s*\}\s*=\s*await\s*params;)/g,
      'const { id } = await params;'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed duplicates in: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Removing duplicate const { id } = await params; lines...\n');

filesToFix.forEach(removeDuplicates);

console.log('\n✨ Done! Duplicates removed.');
