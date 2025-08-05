'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  groupName: string;
  productsCount: number;
}

export function DeleteGroupModal({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  productsCount
}: DeleteGroupModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmValid = confirmText === 'УДАЛИТЬ';

  const handleConfirm = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Удаление группы товаров
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Предупреждение */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Внимание!</strong> Это действие нельзя отменить.
            </AlertDescription>
          </Alert>

          {/* Информация о группе */}
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Вы собираетесь удалить группу:
            </p>
            <div className="bg-slate-50 rounded-lg p-3 border">
              <p className="font-semibold text-slate-900">"{groupName}"</p>
              {productsCount > 0 && (
                <p className="text-sm text-slate-600 mt-1">
                  Содержит {productsCount} товаров
                </p>
              )}
            </div>
          </div>

          {/* Информация о том, что происходит с товарами */}
          {productsCount > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Важно:</strong> Товары не будут удалены. Они останутся в системе без группы и их можно будет переместить в другие группы.
              </AlertDescription>
            </Alert>
          )}

          {/* Поле подтверждения */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Для подтверждения введите: <span className="font-bold text-red-600">УДАЛИТЬ</span>
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Введите УДАЛИТЬ"
              className={`${
                confirmText && !isConfirmValid
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : isConfirmValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : ''
              }`}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-600">
                Введите точно "УДАЛИТЬ" (заглавными буквами)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить группу
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
