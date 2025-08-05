'use client'

import React from 'react';

interface BannerVisualizationProps {
  width: number;      // мм
  height: number;     // мм
  stepSize: number;   // см
  grommetsCount: number;
  foldSize?: number;  // мм
}

export function BannerVisualization({
  width,
  height,
  stepSize,
  grommetsCount,
  foldSize = 0
}: BannerVisualizationProps) {
  // Масштабируем для отображения (максимум 400x300 пикселей)
  const maxDisplayWidth = 400;
  const maxDisplayHeight = 300;
  const scale = Math.min(maxDisplayWidth / width, maxDisplayHeight / height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  
  // Расчет позиций люверсов
  const grommetPositions = [];
  if (stepSize > 0 && grommetsCount > 0) {
    const perimeter = (width + height) * 2;
    const actualStep = perimeter / grommetsCount;
    
    // Упрощенный расчет - равномерно по периметру
    for (let i = 0; i < grommetsCount && i < 50; i++) { // Ограничиваем для производительности
      const distance = (perimeter / grommetsCount) * i;
      let x, y;
      
      if (distance <= width) {
        // Верхняя сторона
        x = distance;
        y = 0;
      } else if (distance <= width + height) {
        // Правая сторона
        x = width;
        y = distance - width;
      } else if (distance <= width * 2 + height) {
        // Нижняя сторона
        x = width - (distance - width - height);
        y = height;
      } else {
        // Левая сторона
        x = 0;
        y = height - (distance - width * 2 - height);
      }
      
      grommetPositions.push({ x, y });
    }
  }
  
  return (
    <div className="bg-background p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Визуализация баннера</h3>
      
      <div className="flex justify-center mb-6">
        <div 
          className="relative" 
          style={{ 
            width: scaledWidth + 80, 
            height: scaledHeight + 80 
          }}
        >
          {/* Область подгиба если есть */}
          {foldSize > 0 && (
            <div
              className="absolute bg-yellow-100 border border-yellow-300 border-dashed rounded opacity-50"
              style={{
                left: 40 - (foldSize * scale),
                top: 40 - (foldSize * scale),
                width: scaledWidth + (foldSize * scale * 2),
                height: scaledHeight + (foldSize * scale * 2),
              }}
            />
          )}
          
          {/* Основной баннер */}
          <div
            className="absolute bg-blue-100 border-2 border-blue-500 rounded shadow-md"
            style={{
              left: 40,
              top: 40,
              width: scaledWidth,
              height: scaledHeight,
            }}
          />
          
          {/* Люверсы */}
          {grommetPositions.map((pos, index) => (
            <div
              key={index}
              className="absolute bg-gray-700 border-2 border-gray-900 rounded-full shadow-sm"
              style={{
                left: 40 + pos.x * scale - 6,
                top: 40 + pos.y * scale - 6,
                width: 12,
                height: 12,
              }}
            />
          ))}
          
          {/* Размеры */}
          <div className="absolute flex items-center justify-center text-sm font-medium text-blue-700" 
               style={{ 
                 left: 40, 
                 top: 20, 
                 width: scaledWidth, 
                 height: 16 
               }}>
            {(width / 1000).toFixed(1)} м
          </div>
          
          <div className="absolute flex items-center justify-center text-sm font-medium text-blue-700 transform -rotate-90" 
               style={{ 
                 left: 15, 
                 top: 40 + scaledHeight / 2 - 8, 
                 width: 16, 
                 height: 16 
               }}>
            {(height / 1000).toFixed(1)} м
          </div>
          
          {/* Индикатор шага люверсов */}
          {grommetPositions.length >= 2 && (
            <>
              <svg
                className="absolute pointer-events-none"
                style={{
                  left: 40,
                  top: 40,
                  width: scaledWidth,
                  height: scaledHeight,
                }}
              >
                <line
                  x1={grommetPositions[0].x * scale}
                  y1={grommetPositions[0].y * scale}
                  x2={grommetPositions[1]?.x * scale || 0}
                  y2={grommetPositions[1]?.y * scale || 0}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              </svg>
              <div 
                className="absolute text-xs bg-red-500 text-white px-2 py-1 rounded shadow"
                style={{
                  left: 40 + (grommetPositions[0].x + (grommetPositions[1]?.x || 0)) * scale / 2 - 20,
                  top: 40 + (grommetPositions[0].y + (grommetPositions[1]?.y || 0)) * scale / 2 - 12,
                }}
              >
                {stepSize} см
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Информационная панель */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">
          <div className="font-medium text-blue-700">Размер</div>
          <div className="text-blue-600">
            {(width/1000).toFixed(1)} × {(height/1000).toFixed(1)} м
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="font-medium text-green-700">Площадь</div>
          <div className="text-green-600">
            {((width * height) / 1000000).toFixed(2)} м²
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded">
          <div className="font-medium text-purple-700">Люверсы</div>
          <div className="text-purple-600">
            {grommetsCount} шт.
          </div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded">
          <div className="font-medium text-orange-700">Шаг</div>
          <div className="text-orange-600">
            {stepSize} см
          </div>
        </div>
        
        {foldSize > 0 && (
          <>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-medium text-yellow-700">Подгиб</div>
              <div className="text-yellow-600">
                {foldSize} мм
              </div>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded">
              <div className="font-medium text-indigo-700">С подгибом</div>
              <div className="text-indigo-600">
                {(((width + foldSize * 2) * (height + foldSize * 2)) / 1000000).toFixed(2)} м²
              </div>
            </div>
          </>
        )}
      </div>
      
      {grommetPositions.length >= 50 && (
        <div className="mt-4 text-xs text-muted-foreground">
          * Показаны первые 50 люверсов для производительности
        </div>
      )}
    </div>
  );
}
