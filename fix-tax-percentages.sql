-- Исправление процентов для налоговых категорий
-- Процент категории должен равняться сумме процентов её элементов

UPDATE fund_categories 
SET percentage = (
    SELECT COALESCE(SUM(percentage), 0) 
    FROM fund_category_items 
    WHERE categoryId = fund_categories.id
)
WHERE categoryType = 'taxes';

-- Проверяем результат
SELECT 
    fc.name as category_name, 
    fc.percentage as category_percentage,
    COALESCE(SUM(fi.percentage), 0) as calculated_percentage
FROM fund_categories fc 
LEFT JOIN fund_category_items fi ON fc.id = fi.categoryId 
WHERE fc.categoryType = 'taxes'
GROUP BY fc.id, fc.name, fc.percentage
ORDER BY fc.name;
