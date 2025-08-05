'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Clock, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateOrderDialog } from '@/components/create-order-dialog'
import { EditOrderDialog } from '@/components/edit-order-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  totalAmount: number
  advancePayment: number
  remainingPayment: number
  currency: string
  status: string
  paymentStatus: string
  productionStatus: string
  orderDate: string
  expectedDeliveryDate?: string
  priority: string
  source: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  itemName: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  status: string
}

interface OrderStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalRevenue: number
  pendingPayments: number
  averageOrderValue: number
}

// Статусы заказов
const ORDER_STATUSES = {
  DRAFT: { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  CONFIRMED: { label: 'Подтвержден', color: 'bg-blue-100 text-blue-800' },
  IN_PRODUCTION: { label: 'В производстве', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Завершен', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Отменен', color: 'bg-red-100 text-red-800' },
}

const PAYMENT_STATUSES = {
  PENDING: { label: 'Ожидает оплаты', color: 'bg-red-100 text-red-800' },
  PARTIAL: { label: 'Частично оплачен', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Оплачен', color: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Просрочена', color: 'bg-red-100 text-red-800' },
}

const PRODUCTION_STATUSES = {
  NOT_STARTED: { label: 'Не начато', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'В процессе', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Готово', color: 'bg-green-100 text-green-800' },
}

const PRIORITIES = {
  LOW: { label: 'Низкий', color: 'bg-green-100 text-green-800' },
  MEDIUM: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Срочный', color: 'bg-red-100 text-red-800' },
}

export function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [productionFilter, setProductionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Диалоги
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)

  // Загрузка данных
  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [currentPage, searchTerm, statusFilter, paymentFilter, productionFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter && paymentFilter !== 'all' && { paymentStatus: paymentFilter }),
        ...(productionFilter && productionFilter !== 'all' && { productionStatus: productionFilter }),
      })

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error('Ошибка загрузки заказов:', data.error)
      }
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/orders/stats')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.summary)
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error)
    }
  }

  const handleOrderCreated = () => {
    setCreateDialogOpen(false)
    fetchOrders()
    fetchStats()
  }

  const handleOrderUpdated = () => {
    setEditingOrder(null)
    fetchOrders()
    fetchStats()
  }

  const handleOrderDeleted = async () => {
    if (!deletingOrder) return

    try {
      const response = await fetch(`/api/orders/${deletingOrder.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDeletingOrder(null)
        fetchOrders()
        fetchStats()
      } else {
        console.error('Ошибка при удалении заказа')
      }
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>
          <p className="text-muted-foreground">
            Управление заказами клиентов и отслеживание их статуса
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Новый заказ
        </Button>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего заказов</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">за текущий месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">В работе</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">активные заказы</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выручка</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">завершенные заказы</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">К доплате</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayments)}</div>
              <p className="text-xs text-muted-foreground">ожидающие оплаты</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>Поиск и фильтрация заказов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по номеру, клиенту, email, телефону..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус заказа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус оплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы оплаты</SelectItem>
                {Object.entries(PAYMENT_STATUSES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productionFilter} onValueChange={setProductionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Статус производства" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(PRODUCTION_STATUSES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица заказов */}
      <Card>
        <CardHeader>
          <CardTitle>Список заказов</CardTitle>
          <CardDescription>
            {orders.length} заказов найдено
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Заказы не найдены
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Оплата</TableHead>
                  <TableHead>Производство</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Приоритет</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        {order.customerEmail && (
                          <div className="text-sm text-muted-foreground">
                            {order.customerEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge className={ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color}>
                        {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.color}>
                        {PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRODUCTION_STATUSES[order.productionStatus as keyof typeof PRODUCTION_STATUSES]?.color}>
                        {PRODUCTION_STATUSES[order.productionStatus as keyof typeof PRODUCTION_STATUSES]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <Badge className={PRIORITIES[order.priority as keyof typeof PRIORITIES]?.color}>
                        {PRIORITIES[order.priority as keyof typeof PRIORITIES]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeletingOrder(order)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Далее
          </Button>
        </div>
      )}

      {/* Диалоги */}
      <CreateOrderDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onOrderCreated={handleOrderCreated}
      />

      {editingOrder && (
        <EditOrderDialog 
          order={editingOrder}
          open={!!editingOrder} 
          onOpenChange={(open) => !open && setEditingOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {deletingOrder && (
        <DeleteConfirmDialog
          open={!!deletingOrder}
          onOpenChange={(open) => !open && setDeletingOrder(null)}
          onConfirm={handleOrderDeleted}
          title="Удалить заказ"
          description={`Вы уверены, что хотите отменить заказ ${deletingOrder.orderNumber}? Это действие нельзя отменить.`}
        />
      )}
    </div>
  )
}
