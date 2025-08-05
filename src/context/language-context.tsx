"use client"

import React, { createContext, useContext, ReactNode } from 'react';
import { Locale, locales, defaultLocale, Translation } from '@/lib/locales';

// Define the shape of our context
interface LanguageContextProps {
  locale: Locale;
  t: Translation; // Current translations
  changeLocale: (newLocale: Locale) => void;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextProps>({
  locale: defaultLocale,
  t: locales[defaultLocale],
  changeLocale: () => {}
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Language Provider Component
interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children,
  initialLocale = defaultLocale 
}) => {
  // Always use Russian locale
  const locale: Locale = 'ru';
  const translations: Translation = locales.ru;

  // Function to change the locale (now does nothing as we only support Russian)
  const changeLocale = (newLocale: Locale) => {
    // Do nothing - we only support Russian
    console.log('Language switching is disabled - only Russian is supported');
  };

  return (
    <LanguageContext.Provider value={{ locale, t: translations, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};
