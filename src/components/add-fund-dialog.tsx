"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, Calendar, Percent } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Fund {
  id: string;
  name: string;
  description: string;
  fundType: string;
  totalAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  status: string;
  startDate: string;
  endDate: string;
  categories?: FundCategory[];
}

interface FundCategory {
  id: string;
  name: string;
  categoryType: string;
  emoji: string;
  plannedAmount: number;
  actualAmount: number;
  percentage: number;
  description: string;
  priority: number;
  items?: FundCategoryItem[];
}

interface FundCategoryItem {
  id: string;
  name: string;
  itemType: string;
  amount: number;
  currency: string;
  percentage: number;
  description: string;
  isRecurring: boolean;
  priority: number;
}

interface AddFundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (fundId: string, categoryId: string, itemId?: string, allocatedAmount?: number, percentage?: number) => Promise<void>;
  productId: string;
}

const fundTypeLabels: Record<string, string> = {
  SALES: "Продажи",
  PRODUCTION: "Производство", 
  PAYROLL: "Зарплата",
  OVERHEAD: "Накладные",
  MARKETING: "Маркетинг",
  R_AND_D: "НИОКР"
};

const fundStatusLabels: Record<string, string> = {
  ACTIVE: "Активный",
  INACTIVE: "Неактивный",
  COMPLETED: "Завершен",
  PENDING: "Ожидает"
};

const categoryTypeLabels: Record<string, string> = {
  FIXED: "Фиксированные",
  VARIABLE: "Переменные",
  OVERHEAD: "Накладные",
  DIRECT: "Прямые",
  INDIRECT: "Косвенные"
};

export function AddFundDialog({ open, onOpenChange, onAdd, productId }: AddFundDialogProps) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<FundCategoryItem | null>(null);
  const [allocationType, setAllocationType] = useState<"amount" | "percentage">("percentage");
  const [allocatedAmount, setAllocatedAmount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  // Загружаем фонды
  useEffect(() => {
    if (open) {
      loadFunds();
    }
  }, [open]);

  const loadFunds = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/funds");
      if (response.ok) {
        const data = await response.json();
        setFunds(data);
      }
    } catch (error) {
      console.error("Failed to load funds:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFunds = funds.filter(fund => 
    fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fund.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fundTypeLabels[fund.fundType]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    if (!selectedFund || !selectedCategory) return;

    try {
      await onAdd(
        selectedFund.id,
        selectedCategory.id,
        selectedItem?.id,
        allocationType === "amount" ? allocatedAmount : undefined,
        allocationType === "percentage" ? percentage : undefined
      );
      handleClose();
    } catch (error) {
      console.error("Failed to add fund:", error);
    }
  };

  const handleClose = () => {
    setSelectedFund(null);
    setSelectedCategory(null);
    setSelectedItem(null);
    setSearchQuery("");
    setAllocatedAmount(0);
    setPercentage(0);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getEstimatedCost = () => {
    if (!selectedCategory) return 0;
    
    if (allocationType === "percentage") {
      return (selectedCategory.plannedAmount * percentage) / 100;
    } else {
      return allocatedAmount;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить фонд к продукту</DialogTitle>
          <DialogDescription>
            Выберите фонд и категорию для распределения расходов на продукт
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Поиск фондов */}
          <div className="space-y-2">
            <Label>Поиск фондов</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Найти фонд по названию, описанию или типу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Список фондов */}
          {!selectedFund && (
            <div className="space-y-2">
              <Label>Доступные фонды</Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Загрузка фондов...</div>
                ) : filteredFunds.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Фонды не найдены</div>
                ) : (
                  <div className="divide-y">
                    {filteredFunds.map((fund) => (
                      <div
                        key={fund.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedFund(fund)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{fund.name}</h3>
                            <p className="text-sm text-gray-600">{fund.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={fund.status === "ACTIVE" ? "default" : "secondary"}>
                              {fundStatusLabels[fund.status] || fund.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {fundTypeLabels[fund.fundType] || fund.fundType}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(fund.startDate)} - {formatDate(fund.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>Общий: {formatCurrency(fund.totalAmount)}</span>
                            <span className="text-green-600">
                              Доступно: {formatCurrency(fund.remainingAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Выбранный фонд и его категории */}
          {selectedFund && !selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Выбранный фонд: {selectedFund.name}</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFund(null)}
                >
                  Изменить фонд
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Выберите категорию</Label>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {selectedFund.categories && selectedFund.categories.length > 0 ? (
                    <div className="divide-y">
                      {selectedFund.categories.map((category) => (
                        <div
                          key={category.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.emoji}</span>
                              <div>
                                <h4 className="font-medium">{category.name}</h4>
                                <p className="text-sm text-gray-600">{category.description}</p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {categoryTypeLabels[category.categoryType] || category.categoryType}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Приоритет: {category.priority}</span>
                            <div className="flex items-center gap-4">
                              <span>План: {formatCurrency(category.plannedAmount)}</span>
                              <span>Факт: {formatCurrency(category.actualAmount)}</span>
                              <span className="flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                {category.percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      У этого фонда нет категорий
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Настройка распределения */}
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Категория: {selectedCategory.emoji} {selectedCategory.name}</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Изменить категорию
                </Button>
              </div>

              {/* Выбор элементов категории (опционально) */}
              {selectedCategory.items && selectedCategory.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Конкретный элемент (опционально)</Label>
                  <Select value={selectedItem?.id || "none"} onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedItem(null);
                    } else {
                      const item = selectedCategory.items?.find(i => i.id === value);
                      setSelectedItem(item || null);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите элемент или оставьте общую категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Общая категория</SelectItem>
                      {selectedCategory.items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - {formatCurrency(item.amount)}
                          {item.isRecurring && " (повторяющийся)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Тип распределения */}
              <div className="space-y-2">
                <Label>Способ распределения</Label>
                <Select value={allocationType} onValueChange={(value: "amount" | "percentage") => setAllocationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Процент от плановой суммы категории</SelectItem>
                    <SelectItem value="amount">Фиксированная сумма</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ввод значения */}
              {allocationType === "percentage" ? (
                <div className="space-y-2">
                  <Label>Процент от плановой суммы ({formatCurrency(selectedCategory.plannedAmount)})</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Введите процент"
                    value={percentage || ""}
                    onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Сумма распределения (RUB)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Введите сумму"
                    value={allocatedAmount || ""}
                    onChange={(e) => setAllocatedAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* Предварительный расчет */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Расчетная стоимость:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(getEstimatedCost())}
                  </span>
                </div>
                {allocationType === "percentage" && (
                  <p className="text-sm text-gray-600 mt-1">
                    {percentage}% от {formatCurrency(selectedCategory.plannedAmount)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={!selectedFund || !selectedCategory || (allocationType === "percentage" ? percentage <= 0 : allocatedAmount <= 0)}
          >
            Добавить фонд
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
