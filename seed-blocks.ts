import { prisma } from './src/lib/prisma'

const productBlocks = [
  // Блок материалов - деревянные
  {
    id: 'block-wood-materials',
    name: 'Деревянные материалы',
    description: 'Базовые деревянные материалы для мебели',
    type: 'MATERIALS',
    category: 'Материалы',
    icon: '🪵',
    config: {
      materials: [
        {
          materialCode: 'WOOD_PINE',
          name: 'Сосна',
          quantityFormula: 'length * width * thickness / 1000000000', // м³
          wastePercent: 15,
          conditions: 'material_type == "wood"'
        },
        {
          materialCode: 'WOOD_OAK',
          name: 'Дуб',
          quantityFormula: 'length * width * thickness / 1000000000', // м³
          wastePercent: 10,
          conditions: 'material_type == "wood"'
        }
      ]
    }
  },

  // Блок материалов - металлические
  {
    id: 'block-metal-materials',
    name: 'Металлические материалы',
    description: 'Металлопрокат и фурнитура',
    type: 'MATERIALS',
    category: 'Материалы',
    icon: '🔩',
    config: {
      materials: [
        {
          materialCode: 'STEEL_PROFILE',
          name: 'Стальной профиль',
          quantityFormula: 'length / 1000', // м
          wastePercent: 5,
          conditions: 'material_type == "metal"'
        },
        {
          materialCode: 'ALUMINUM_SHEET',
          name: 'Алюминиевый лист',
          quantityFormula: 'length * width / 1000000', // м²
          wastePercent: 8,
          conditions: 'material_type == "metal"'
        }
      ]
    }
  },

  // Блок работ - столярные
  {
    id: 'block-wood-work',
    name: 'Столярные работы',
    description: 'Основные виды столярных работ',
    type: 'WORK_TYPES',
    category: 'Работы',
    icon: '🔨',
    config: {
      workTypes: [
        {
          workTypeCode: 'CUTTING',
          name: 'Распиловка',
          timeFormula: 'perimeter / 100', // часы
          conditions: 'has_cutting == true'
        },
        {
          workTypeCode: 'ASSEMBLY',
          name: 'Сборка',
          timeFormula: 'complexity * 2', // часы
          conditions: 'assembly_required == true'
        }
      ]
    }
  },

  // Блок параметров
  {
    id: 'block-furniture-options',
    name: 'Параметры мебели',
    description: 'Основные настройки для мебельных изделий',
    type: 'OPTIONS',
    category: 'Параметры',
    icon: '⚙️',
    config: {
      parameters: [
        {
          name: 'material_type',
          label: 'Тип материала',
          type: 'select',
          options: ['wood', 'metal', 'plastic'],
          default: 'wood',
          helpText: 'Основной материал изделия'
        },
        {
          name: 'complexity',
          label: 'Сложность изделия',
          type: 'number',
          min: 1,
          max: 10,
          default: 5,
          unit: 'балл',
          helpText: 'Коэффициент сложности от 1 до 10'
        },
        {
          name: 'finish_type',
          label: 'Тип отделки',
          type: 'select',
          options: ['natural', 'painted', 'varnished'],
          default: 'natural',
          helpText: 'Вид финишной отделки'
        }
      ]
    }
  },

  // Блок формул
  {
    id: 'block-cost-formulas',
    name: 'Формулы расчета стоимости',
    description: 'Дополнительные расчетные формулы',
    type: 'FORMULAS',
    category: 'Формулы',
    icon: '🧮',
    config: {
      formulas: [
        {
          code: 'surface_area',
          name: 'Площадь поверхности',
          expression: '2 * (length * width + length * height + width * height) / 1000000',
          roundingMethod: 'ROUND',
          precision: 3,
          description: 'Площадь поверхности для расчета покрытий'
        },
        {
          code: 'finish_cost',
          name: 'Стоимость отделки',
          expression: 'surface_area * finish_cost_per_m2',
          roundingMethod: 'ROUND',
          precision: 2,
          description: 'Стоимость финишной отделки'
        }
      ]
    }
  }
]

async function seedBlocks() {
  console.log('🌱 Заполнение блоков конструктора...')
  
  // Удаляем старые блоки
  await prisma.productBlock.deleteMany({})
  
  // Создаем новые блоки
  for (const blockData of productBlocks) {
    await prisma.productBlock.create({
      data: {
        ...blockData,
        config: JSON.stringify(blockData.config),
        isActive: true,
        isSystem: false
      }
    })
    console.log(`✅ Создан блок: ${blockData.name}`)
  }
  
  console.log('🎉 Блоки успешно созданы!')
}

seedBlocks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
