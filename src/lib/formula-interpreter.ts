// Тип для параметров формулы
export type FormulaParams = Record<string, number | string | boolean>;

// Класс для работы с формулами
export class FormulaInterpreter {
  // Статический метод для вычисления формулы
  static evaluate(formula: string, params: FormulaParams): number {
    try {
      // Проверяем безопасность формулы
      this.validateFormula(formula);
      
      // Создаем функцию с параметрами
      const argNames = Object.keys(params);
      const argValues = Object.values(params);
      
      // Добавляем математические функции в контекст
      const mathContext = {
        Math,
        // Дополнительные полезные функции
        round: Math.round,
        ceil: Math.ceil,
        floor: Math.floor,
        max: Math.max,
        min: Math.min,
        abs: Math.abs,
        sqrt: Math.sqrt,
        pow: Math.pow,
        PI: Math.PI
      };
      
      // Создаем контекст выполнения с параметрами и Math
      const context = [...Object.keys(mathContext), ...argNames];
      const contextValues = [...Object.values(mathContext), ...argValues];
      
      // Создаем безопасную функцию для вычисления
      // eslint-disable-next-line no-new-func
      const evalFunction = new Function(...context, `return ${formula}`);
      
      // Вычисляем результат
      const result = evalFunction(...contextValues);
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      throw error;
    }
  }

  // Валидация формулы на безопасность
  private static validateFormula(formula: string): void {
    // Запрещаем опасные конструкции
    const dangerousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /new\s+Function/i,
      /console\./i,
      /document\./i,
      /window\./i,
      /localStorage\./i,
      /sessionStorage\./i,
      /fetch\s*\(/i,
      /import\s*\(/i,
      /require\s*\(/i,
      /process\./i,
      /global\./i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(formula)) {
        throw new Error(`Формула содержит запрещенную конструкцию: ${pattern}`);
      }
    }

    // Проверяем, что формула не пустая
    if (!formula.trim()) {
      throw new Error('Формула не может быть пустой');
    }
  }

  // Получить список доступных функций
  static getAvailableFunctions(): string[] {
    return [
      'Math.ceil(x)', 'Math.floor(x)', 'Math.round(x)',
      'Math.max(x, y)', 'Math.min(x, y)', 'Math.abs(x)',
      'Math.sqrt(x)', 'Math.pow(x, y)', 'Math.PI',
      'ceil(x)', 'floor(x)', 'round(x)',
      'max(x, y)', 'min(x, y)', 'abs(x)',
      '+, -, *, /, %, ()', 'x > y, x < y, x >= y, x <= y',
      'x ? y : z (тернарный оператор)'
    ];
  }
}
