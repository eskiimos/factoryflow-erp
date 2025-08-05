"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CalculatorUnavailable() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Функционал временно недоступен</CardTitle>
          <CardDescription>
            Калькулятор находится в разработке
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ограничение доступа</AlertTitle>
            <AlertDescription>
              Функционал калькулятора находится в стадии активной разработки и временно недоступен.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Детали</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Разделы <code>/calculator</code>, <code>/calculator/component</code> и <code>/calculator/linear</code> временно недоступны</li>
              <li>Расчет стоимости продукции можно выполнить через стандартный редактор продуктов</li>
              <li>Функционал будет доступен после завершения интеграции (ожидаемая дата: август 2025)</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center pt-4">
            <Button onClick={() => router.push('/')} className="w-full md:w-auto">
              Вернуться на главную страницу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
