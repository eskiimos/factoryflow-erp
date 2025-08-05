import { prisma } from './src/lib/prisma'

const resources = [
  // Материалы
  {
    code: 'WOOD_PINE',
    name: 'Сосна',
    type: 'MATERIAL',
    baseUnit: 'м³',
    costPrice: 25000,
    currency: 'RUB',
    description: 'Сосновая доска'
  },
  {
    code: 'WOOD_OAK',
    name: 'Дуб',
    type: 'MATERIAL',
    baseUnit: 'м³',
    costPrice: 85000,
    currency: 'RUB',
    description: 'Дубовая доска'
  },
  {
    code: 'STEEL_PROFILE',
    name: 'Стальной профиль',
    type: 'MATERIAL',
    baseUnit: 'м',
    costPrice: 800,
    currency: 'RUB',
    description: 'Металлический профиль'
  },
  {
    code: 'ALUMINUM_SHEET',
    name: 'Алюминиевый лист',
    type: 'MATERIAL',
    baseUnit: 'м²',
    costPrice: 1200,
    currency: 'RUB',
    description: 'Алюминиевый лист'
  },
  
  // Работы
  {
    code: 'CUTTING',
    name: 'Распиловка',
    type: 'LABOR',
    baseUnit: 'час',
    costPrice: 1500,
    currency: 'RUB',
    description: 'Распиловка материала'
  },
  {
    code: 'ASSEMBLY',
    name: 'Сборка',
    type: 'LABOR',
    baseUnit: 'час',
    costPrice: 2000,
    currency: 'RUB',
    description: 'Сборка изделия'
  }
]

async function seedResources() {
  console.log('🌱 Заполнение ресурсов...')
  
  for (const resourceData of resources) {
    await prisma.resource.upsert({
      where: { code: resourceData.code },
      create: {
        ...resourceData,
        isActive: true
      },
      update: {
        ...resourceData,
        isActive: true
      }
    })
    console.log(`✅ Создан/обновлен ресурс: ${resourceData.name}`)
  }
  
  console.log('🎉 Ресурсы успешно созданы!')
}

seedResources()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
