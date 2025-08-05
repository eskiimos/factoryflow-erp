'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CalculatorTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await testFn()
      setTestResults(prev => [...prev, { 
        test: testName, 
        status: 'success', 
        result,
        timestamp: new Date().toLocaleTimeString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, { 
        test: testName, 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const testCreateOrder = async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Тестовый клиент',
        vatRate: 20.0,
        applyVat: true,
      })
    })
    const data = await response.json()
    return { orderId: data.data.id, orderNumber: data.data.orderNumber }
  }

  const testAddProduct = async () => {
    // Сначала создаем заказ
    const orderData = await testCreateOrder()
    
    // Добавляем товар с формулой
    const response = await fetch('/api/orders/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.orderId,
        productId: 'test-product-id', // Нужно будет получить реальный ID
        quantity: 2,
        parameters: {
          height: 3,
          width: 2
        }
      })
    })
    const data = await response.json()
    return { ...orderData, itemAdded: data.success }
  }

  const testGetProducts = async () => {
    const response = await fetch('/api/products?includeParameters=true')
    const data = await response.json()
    return { 
      total: data.data.length, 
      withFormulas: data.data.filter((p: any) => p.formulaEnabled).length,
      products: data.data.filter((p: any) => p.formulaEnabled).map((p: any) => ({
        id: p.id,
        name: p.name,
        formula: p.formulaExpression,
        parameters: p.parameters?.length || 0
      }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Тестирование калькулятора</h1>
          <p className="text-muted-foreground">
            Проверка функциональности модульного калькулятора заказов
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Тесты */}
        <Card>
          <CardHeader>
            <CardTitle>Запуск тестов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => runTest('Получение товаров', testGetProducts)}
              disabled={loading}
              className="w-full"
            >
              Тест: Загрузка товаров с формулами
            </Button>
            
            <Button 
              onClick={() => runTest('Создание заказа', testCreateOrder)}
              disabled={loading}
              className="w-full"
            >
              Тест: Создание нового заказа
            </Button>
            
            <Button 
              onClick={() => runTest('Добавление товара', testAddProduct)}
              disabled={loading}
              className="w-full"
            >
              Тест: Добавление товара с параметрами
            </Button>

            <Button 
              onClick={() => setTestResults([])}
              variant="outline"
              className="w-full"
            >
              Очистить результаты
            </Button>
          </CardContent>
        </Card>

        {/* Результаты */}
        <Card>
          <CardHeader>
            <CardTitle>Результаты тестов</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">Запустите тесты для просмотра результатов</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.test}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    {result.status === 'success' ? (
                      <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ссылки */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые ссылки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="/orders/calculator" target="_blank">
                Открыть калькулятор
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/products" target="_blank">
                Управление товарами
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/orders" target="_blank">
                Список заказов
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
