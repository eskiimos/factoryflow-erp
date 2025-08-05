"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"
import { Locale, localeNames } from "@/lib/locales"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SettingsPage() {
  const { locale, t, changeLocale } = useLanguage()

  const handleLanguageChange = (value: string) => {
    changeLocale(value as Locale)
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.settings.title}</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.language.title}</CardTitle>
              <CardDescription>{t.settings.language.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Select value={locale} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(localeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional settings sections can be added here */}
          
        </div>
      </div>
    </div>
  )
}
