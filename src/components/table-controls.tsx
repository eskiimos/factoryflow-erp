'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2, Eye, EyeOff } from 'lucide-react';

export interface ColumnVisibility {
  [key: string]: boolean;
}

interface TableControlsProps {
  columns: Array<{
    key: string;
    label: string;
    required?: boolean;
  }>;
  visibility: ColumnVisibility;
  onVisibilityChange: (visibility: ColumnVisibility) => void;
}

export function TableControls({ columns, visibility, onVisibilityChange }: TableControlsProps) {
  const toggleColumn = (columnKey: string) => {
    onVisibilityChange({
      ...visibility,
      [columnKey]: !visibility[columnKey],
    });
  };

  const showAllColumns = () => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach(column => {
      newVisibility[column.key] = true;
    });
    onVisibilityChange(newVisibility);
  };

  const hideOptionalColumns = () => {
    const newVisibility: ColumnVisibility = {};
    columns.forEach(column => {
      newVisibility[column.key] = column.required || false;
    });
    onVisibilityChange(newVisibility);
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Столбцы ({visibleCount}/{columns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Управление столбцами</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={showAllColumns}>
          <Eye className="h-4 w-4 mr-2" />
          Показать все
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={hideOptionalColumns}>
          <EyeOff className="h-4 w-4 mr-2" />
          Скрыть опциональные
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            onClick={() => !column.required && toggleColumn(column.key)}
            className={column.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          >
            <div className="flex items-center space-x-2 w-full">
              <Checkbox
                checked={visibility[column.key]}
                disabled={column.required}
                onChange={() => !column.required && toggleColumn(column.key)}
              />
              <span className="flex-1">{column.label}</span>
              {column.required && (
                <span className="text-xs text-muted-foreground">обязательный</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
