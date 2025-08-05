import { NextRequest, NextResponse } from 'next/server';

// Демо данные единиц измерения
const units = [
  // Линейные
  { id: 'mm', name: 'Миллиметры', group: 'Линейные', baseUnitId: 'mm', coefficient: 1 },
  { id: 'cm', name: 'Сантиметры', group: 'Линейные', baseUnitId: 'mm', coefficient: 10 },
  { id: 'm', name: 'Метры', group: 'Линейные', baseUnitId: 'mm', coefficient: 1000 },
  
  // Площадь
  { id: 'cm2', name: 'Кв. сантиметры', group: 'Площадь', baseUnitId: 'cm2', coefficient: 1 },
  { id: 'm2', name: 'Кв. метры', group: 'Площадь', baseUnitId: 'cm2', coefficient: 10000 },
  
  // Объём
  { id: 'ml', name: 'Миллилитры', group: 'Объём', baseUnitId: 'ml', coefficient: 1 },
  { id: 'l', name: 'Литры', group: 'Объём', baseUnitId: 'ml', coefficient: 1000 },
  { id: 'm3', name: 'Куб. метры', group: 'Объём', baseUnitId: 'ml', coefficient: 1000000 },
  
  // Масса
  { id: 'g', name: 'Граммы', group: 'Масса', baseUnitId: 'g', coefficient: 1 },
  { id: 'kg', name: 'Килограммы', group: 'Масса', baseUnitId: 'g', coefficient: 1000 },
  { id: 't', name: 'Тонны', group: 'Масса', baseUnitId: 'g', coefficient: 1000000 },
  
  // Количество
  { id: 'pcs', name: 'Штуки', group: 'Количество', baseUnitId: 'pcs', coefficient: 1 },
  { id: 'pair', name: 'Пары', group: 'Количество', baseUnitId: 'pcs', coefficient: 2 },
  { id: 'set', name: 'Наборы', group: 'Количество', baseUnitId: 'pcs', coefficient: 1 },
  { id: 'pack', name: 'Упаковки', group: 'Количество', baseUnitId: 'pcs', coefficient: 1 },
  
  // Время
  { id: 'min', name: 'Минуты', group: 'Время', baseUnitId: 'min', coefficient: 1 },
  { id: 'hour', name: 'Часы', group: 'Время', baseUnitId: 'min', coefficient: 60 },
  { id: 'day', name: 'Дни', group: 'Время', baseUnitId: 'min', coefficient: 1440 },
  
  // Специальные
  { id: 'op', name: 'Операции', group: 'Специальные', baseUnitId: 'op', coefficient: 1 },
  { id: 'run', name: 'Прогоны', group: 'Специальные', baseUnitId: 'run', coefficient: 1 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    let filteredUnits = units;
    
    if (group) {
      filteredUnits = units.filter(unit => unit.group === group);
    }
    
    return NextResponse.json(filteredUnits);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
