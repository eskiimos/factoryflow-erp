'use client';

import { 
  CalculationParameters, 
  TemplateField,
  ParameterCategory
} from '@/types/calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ParameterInputProps {
  fields: TemplateField[];
  parameters: CalculationParameters;
  onParameterChange: (category: ParameterCategory, id: string, value: any) => void;
}

export function ParameterInput({ fields, parameters, onParameterChange }: ParameterInputProps) {

  // Получаем текущий тип расчета для условного отображения полей
  const calculationType = parameters.basic.calculation_type;

  // Определяем, какие поля показывать в зависимости от типа расчета
  const shouldShowField = (field: TemplateField) => {
    switch (field.id) {
      case 'calculation_type':
        return true; // Всегда показываем выбор типа расчета
      case 'width':
        return ['area', 'area_with_waste', 'perimeter', 'linear_meters'].includes(calculationType);
      case 'height':
        return ['area', 'area_with_waste', 'perimeter', 'height_quantity'].includes(calculationType);
      case 'length':
        return ['linear_meters'].includes(calculationType);
      case 'waste_percentage':
        return ['area_with_waste'].includes(calculationType);
      default:
        return true;
    }
  };

  const renderField = (field: TemplateField) => {
    const category = field.category;
    const value = parameters[category][field.id];

    switch (field.type) {
      case 'number':
        return (
          <Input
            type="number"
            id={field.id}
            value={value || ''}
            onChange={(e) => onParameterChange(category, field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            required={field.validation?.required}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            id={field.id}
            value={value || ''}
            onChange={(e) => onParameterChange(category, field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => onParameterChange(category, field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => onParameterChange(category, field.id, newValue)}
            required={field.validation?.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
            <Textarea
                id={field.id}
                value={value || ''}
                onChange={(e) => onParameterChange(category, field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.validation?.required}
            />
        );
      case 'slider':
        return (
            <Input
                type="range"
                id={field.id}
                value={value || 0}
                onChange={(e) => onParameterChange(category, field.id, parseInt(e.target.value))}
                min={field.validation?.min}
                max={field.validation?.max}
                step={field.validation?.step || 1}
                className="mt-1"
            />
        );
      case 'checkbox':
        return (
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id={field.id}
                    checked={!!value}
                    onCheckedChange={(checked) => onParameterChange(category, field.id, checked)}
                />
                <Label htmlFor={field.id} className="font-normal">{field.label}</Label>
            </div>
        );
      default:
        return <p>Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div className="space-y-4">
      {fields.filter(shouldShowField).map(field => (
        <div key={field.id} className="grid gap-2">
          <Label htmlFor={field.id}>{field.label} {field.unit && `(${field.unit})`}</Label>
          {renderField(field)}
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
        </div>
      ))}
    </div>
  );
}
