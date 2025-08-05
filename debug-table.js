// Отладочный скрипт для проверки расчета высоты строк

function calculateTextHeight(text, maxWidth = 380) {
  const avgCharWidth = 8.5;
  const lineHeight = 20;
  const padding = 16;
  
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  const words = text.split(' ');
  let actualLines = 1;
  let currentLineLength = 0;
  
  for (const word of words) {
    if (currentLineLength + word.length + 1 > charsPerLine) {
      actualLines++;
      currentLineLength = word.length;
    } else {
      currentLineLength += word.length + 1;
    }
  }
  
  return Math.max(52, padding + (actualLines * lineHeight) + padding);
}

// Тестовые данные
const testTexts = [
  'Короткое название',
  'Очень длинное название материала которое должно переноситься на несколько строк в таблице для тестирования виртуализации',
  'Супер мега ультра длинное название материала с большим количеством символов для проверки корректной работы переноса текста в ячейках таблицы'
];

console.log('Тестирование расчета высоты строк:');
testTexts.forEach((text, index) => {
  const height = calculateTextHeight(text);
  console.log(`${index + 1}. "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" - высота: ${height}px`);
});
