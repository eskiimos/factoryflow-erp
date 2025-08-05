"use client"

import { useEffect } from 'react';
import { DirectCombobox } from '@/components/ui/direct-combobox';
import { useLanguage } from '@/context/language-context';
import { getLocalizedConstants, UNITS_OF_MEASUREMENT, UNIT_CATEGORIES } from '@/lib/constants';

interface MaterialComboboxProps {
  variant: 'unit' | 'currency' | 'category';
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string; searchTerms?: string[] }[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  error?: string;
  groupByCategory?: boolean;
  allowEmpty?: boolean;
}

export function MaterialCombobox({
  type,
  value,
  onChange,
  options: externalOptions,
  placeholder,
  emptyMessage,
  className,
  error,
  groupByCategory = false,
  allowEmpty = false
}: MaterialComboboxProps) {
  const { locale, t } = useLanguage();
  const constants = getLocalizedConstants();
  
  let options = externalOptions;
  
  // If external options are not provided, use localized constants
  if (!options) {
    if (type === 'unit') {
      // Преобразуем категории в соответствии с выбранным языком
      options = UNITS_OF_MEASUREMENT.map((unit: any) => {
        // Определяем ключ категории по русскому названию
        const categoryKey = Object.entries(UNIT_CATEGORIES).find(
          ([key, value]) => value === unit.category
        )?.[0] as keyof typeof constants.unitCategories;
        
        return {
          ...unit,
          // Используем локализованное название категории
          category: categoryKey ? constants.unitCategories[categoryKey] : 'Другие'
        };
      });
    } else if (type === 'currency') {
      options = constants.currencies;
    }
  }
  
  // Get placeholders and error messages from translations
  const fieldTranslations = t.materialForm.fields;
  
  let fieldPlaceholder = '';
  let fieldEmptyMessage = '';
  
  if (type === 'unit') {
    fieldPlaceholder = fieldTranslations.unitPlaceholder;
    fieldEmptyMessage = fieldTranslations.unitNotFound;
  } else if (type === 'currency') {
    fieldPlaceholder = fieldTranslations.currencyPlaceholder;
    fieldEmptyMessage = fieldTranslations.currencyNotFound;
  } else if (type === 'category') {
    fieldPlaceholder = fieldTranslations.categoryPlaceholder;
    fieldEmptyMessage = fieldTranslations.categoryNotFound;
  }
  
  return (
    <div className="w-full">
      <div className="relative">
        <DirectCombobox
          options={options || []}
          value={value}
          onChange={onChange}
          placeholder={placeholder || fieldPlaceholder}
          emptyMessage={emptyMessage || fieldEmptyMessage}
          className={`${error ? "border-red-500" : ""} ${className}`}
          groupByCategory={type === 'unit' && groupByCategory}
        />
        {allowEmpty && value && (
          <button 
            type="button"
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            onClick={() => onChange("")}
            title="Очистить"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
