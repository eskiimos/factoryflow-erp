const fs = require('fs');
const path = require('path');

// Список файлов для исправления
const filesToFix = [
  'src/app/api/departments/[id]/route.ts',
  'src/app/api/employees/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/orders/[id]/items/route.ts',
  'src/app/api/orders/calculator/[id]/recalculate/route.ts',
  'src/app/api/fund-items/[id]/route.ts',
  'src/app/api/budget-plans/[id]/route.ts'
];

function fixApiRoute(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Замена params type definition
    content = content.replace(
      /\{ params \}: \{ params: \{ id: string \} \}/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );
    
    // Добавление await params в функции
    content = content.replace(
      /(\)\s*{\s*try\s*{\s*)(const\s+[^=]*=\s*await\s+)/g,
      (match, p1, p2) => {
        if (!p1.includes('const { id } = await params;')) {
          return p1 + 'const { id } = await params;\n    ' + p2;
        }
        return match;
      }
    );
    
    // Замена params.id на id
    content = content.replace(/params\.id/g, 'id');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing API routes for Next.js 15 compatibility...\n');

filesToFix.forEach(fixApiRoute);

console.log('\n✨ Done! All API routes have been updated.');
