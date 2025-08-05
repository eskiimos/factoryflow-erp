"use client"

import React from "react";
import { MaterialItemWithCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

interface MaterialsTableContentProps {
  materials: MaterialItemWithCategory[];
  searchTerm: string;
  onEdit?: (material: MaterialItemWithCategory) => void;
  onDelete?: (id: string) => void;
}

export function MaterialsTableContent({ 
  materials, 
  searchTerm, 
  onEdit,
  onDelete
}: MaterialsTableContentProps) {
  const { t } = useLanguage();

  if (materials.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Единица</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Группа</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                {searchTerm ? t.materials.search.noItems : t.materials.empty}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Единица</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Группа</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Создан</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow 
              key={material.id}
              className={
                searchTerm && 
                material.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ? "bg-blue-50"
                  : ""
              }
            >
              <TableCell className="font-medium">{material.name}</TableCell>
              <TableCell>{material.unit}</TableCell>
              <TableCell>{formatCurrency(material.price, material.currency)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {material.category?.name || "—"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={material.isActive ? "default" : "secondary"}
                  className={material.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {material.isActive ? "Активный" : "Неактивный"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(new Date(material.createdAt))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit && onEdit(material)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete && onDelete(material.id)}
                    className="h-8 w-8 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
