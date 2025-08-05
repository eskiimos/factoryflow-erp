# Отключение поддержки английского языка

## Выполненные изменения

### 1. Удалены файлы локализации
- `src/lib/locales/en.ts` - удален файл английских переводов
- `src/lib/locales/ru_old.ts` - удален старый файл с синтаксическими ошибками

### 2. Обновлены файлы локализации
- `src/lib/locales/index.ts` - убрана поддержка английского языка, остался только русский
- `src/context/language-context.tsx` - упрощен контекст, всегда используется русский язык
- `src/components/language-switcher.tsx` - заменен на пустой компонент (возвращает null)

### 3. Обновлены константы
- `src/lib/constants.ts` - убраны английские константы (UNIT_CATEGORIES_EN, CURRENCIES_EN, STATUS_LABELS_EN)
- Функция `getLocalizedConstants()` больше не принимает параметр языка

### 4. Обновлены компоненты
- `src/components/material-combobox.tsx` - убраны проверки на английский язык
- `src/components/ui/combobox.tsx` - убраны проверки на английский язык
- `src/components/ui/direct-combobox.tsx` - убраны проверки на английский язык
- `src/components/ui/simple-combobox.tsx` - убраны проверки на английский язык
- `src/components/ui/bento-grid.tsx` - убрана зависимость от framer-motion для избежания конфликтов типов

### 5. Исправлены API роуты для Next.js 15
- `src/app/api/categories/[id]/route.ts` - обновлен для работы с Promise params
- `src/app/api/material-items/[id]/route.ts` - обновлен для работы с Promise params
- `src/app/categories/[id]/page.tsx` - обновлен для работы с Promise params
- `src/app/api/dashboard/stats/route.ts` - исправлена проблема с null значениями

### 6. Исправлены Zod схемы
- `src/app/api/material-items/bulk-actions/route.ts` - убраны refine валидации из discriminated union

## Результат

Теперь FactoryFlow ERP поддерживает только русский язык:
- Интерфейс всегда на русском языке
- Переключатель языка не отображается
- Все тексты и метки на русском
- Нет возможности переключиться на английский язык
- Проект успешно компилируется и запускается

## Проверка

1. Проект успешно собирается: `npm run build`
2. Сервер разработки запускается: `npm run dev`
3. Интерфейс полностью на русском языке
4. Переключатель языка отсутствует в навигации
5. Массовые действия для материалов работают корректно
6. Страницы категорий работают с русской локализацией

Задача по отключению английского языка завершена успешно!
