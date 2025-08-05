'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Copy, DollarSign, Building } from "lucide-react"

interface FundCreationChoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateNew: () => void
  onCopyExisting: () => void
}

export default function FundCreationChoiceDialog({ 
  isOpen, 
  onClose, 
  onCreateNew, 
  onCopyExisting 
}: FundCreationChoiceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Создание фонда
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <p className="text-gray-600 mb-6 text-center">
            Выберите способ создания нового фонда
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Создать новый фонд */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Создать новый фонд</CardTitle>
                <CardDescription>
                  Создайте фонд с нуля, настроив все параметры и категории
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={onCreateNew}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать новый
                </Button>
              </CardContent>
            </Card>

            {/* Скопировать существующий фонд */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Copy className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Скопировать фонд</CardTitle>
                <CardDescription>
                  Создайте копию существующего фонда и адаптируйте под новые задачи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={onCopyExisting}
                  variant="outline" 
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Скопировать
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Рекомендации:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Новый фонд</strong> - для уникальных проектов и задач</li>
                  <li>• <strong>Копирование</strong> - для похожих фондов с изменениями</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
