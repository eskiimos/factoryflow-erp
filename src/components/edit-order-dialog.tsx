'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  totalAmount: number
  advancePayment: number
  status: string
  paymentStatus: string
  productionStatus: string
  priority: string
  source: string
  notes?: string
  internalNotes?: string
}

interface EditOrderDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderUpdated: () => void
}

interface EditOrderForm {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  status: string
  paymentStatus: string
  productionStatus: string
  priority: string
  source: string
  notes?: string
  internalNotes?: string
  advancePayment: number
}

export function EditOrderDialog({ order, open, onOpenChange, onOrderUpdated }: EditOrderDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<EditOrderForm>({
    defaultValues: {
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      status: order.status,
      paymentStatus: order.paymentStatus,
      productionStatus: order.productionStatus,
      priority: order.priority,
      source: order.source,
      notes: order.notes || '',
      internalNotes: order.internalNotes || '',
      advancePayment: order.advancePayment
    }
  })

  // Обновляем форму при изменении заказа
  useEffect(() => {
    form.reset({
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      status: order.status,
      paymentStatus: order.paymentStatus,
      productionStatus: order.productionStatus,
      priority: order.priority,
      source: order.source,
      notes: order.notes || '',
      internalNotes: order.internalNotes || '',
      advancePayment: order.advancePayment
    })
  }, [order, form])

  const onSubmit = async (data: EditOrderForm) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        onOrderUpdated()
      } else {
        const error = await response.json()
        console.error('Ошибка при обновлении заказа:', error)
      }
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактировать заказ {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Изменение информации о заказе и его статусах.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                rules={{ required: 'Имя клиента обязательно' }}
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Имя клиента *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Введите имя клиента" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+7 (999) 123-45-67" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="client@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Адрес доставки или работ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Статус заказа</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Черновик</SelectItem>
                        <SelectItem value="CONFIRMED">Подтвержден</SelectItem>
                        <SelectItem value="IN_PRODUCTION">В производстве</SelectItem>
                        <SelectItem value="COMPLETED">Завершен</SelectItem>
                        <SelectItem value="CANCELLED">Отменен</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Статус оплаты</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Ожидает оплаты</SelectItem>
                        <SelectItem value="PARTIAL">Частично оплачен</SelectItem>
                        <SelectItem value="PAID">Оплачен</SelectItem>
                        <SelectItem value="OVERDUE">Просрочена</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productionStatus"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Статус производства</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NOT_STARTED">Не начато</SelectItem>
                        <SelectItem value="IN_PROGRESS">В процессе</SelectItem>
                        <SelectItem value="COMPLETED">Готово</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Приоритет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Низкий</SelectItem>
                        <SelectItem value="MEDIUM">Средний</SelectItem>
                        <SelectItem value="HIGH">Высокий</SelectItem>
                        <SelectItem value="URGENT">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Источник</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DIRECT">Прямое обращение</SelectItem>
                        <SelectItem value="WEBSITE">Сайт</SelectItem>
                        <SelectItem value="PHONE">Телефон</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="REFERRAL">Рекомендация</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="advancePayment"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Предоплата</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="0" 
                        step="0.01"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Примечания клиента</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Примечания к заказу" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Внутренние заметки</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Внутренние заметки для сотрудников" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
