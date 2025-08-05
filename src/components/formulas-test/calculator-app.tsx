'use client'

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleCalculator } from './simple-calculator';
import { FormulaConstructor } from './formula-constructor';
import { Calculator, Wrench } from 'lucide-react';

export function CalculatorApp() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="calculators" className="w-full">
        <div className="border-b">
          <div className="max-w-6xl mx-auto px-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calculators" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Готовые калькуляторы
              </TabsTrigger>
              <TabsTrigger value="constructor" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Конструктор формул
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="calculators" className="mt-0">
          <SimpleCalculator />
        </TabsContent>

        <TabsContent value="constructor" className="mt-0">
          <FormulaConstructor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
