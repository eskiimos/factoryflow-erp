'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalculationTemplate,
  ProductCalculationType,
  IndustryGroup
} from '@/types/calculator';
import { Loader2, Search, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectorProps {
  productType: ProductCalculationType;
  onSelect: (template: CalculationTemplate) => void;
  onBack: () => void;
}

// Mock API
const fetchTemplatesAPI = async (productType: ProductCalculationType): Promise<CalculationTemplate[]> => {
    console.log(`Fetching templates for product type: ${productType}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allTemplates: CalculationTemplate[] = [
        { 
            id: 't1', name: 'Листовой раскрой ПВХ', description: 'Базовый раскрой листовых материалов с учетом отходов.',
            industryGroup: 'SHEET_CUTTING', productType: 'STANDARD', tags: ['ПВХ', 'Раскрой', 'Листовой'],
            rules: { vatIncluded: true, minQuantity: 1, approvalThresholds: { discountPercent: 15, marginPercent: 10 } }, 
            presets: [], 
            fields: [
                { id: 'material_thickness', category: 'basic', label: 'Толщина материала', type: 'select', options: [{value: '3', label: '3 мм'}, {value: '5', label: '5 мм'}], defaultValue: '3', validation: { required: true } },
                { id: 'sheet_width', category: 'basic', label: 'Ширина листа', type: 'number', unit: 'мм', defaultValue: 2050, validation: { required: true, min: 100 } },
                { id: 'sheet_height', category: 'basic', label: 'Высота листа', type: 'number', unit: 'мм', defaultValue: 3050, validation: { required: true, min: 100 } },
                { id: 'item_width', category: 'basic', label: 'Ширина изделия', type: 'number', unit: 'мм', defaultValue: 1000, validation: { required: true, min: 10 } },
                { id: 'item_height', category: 'basic', label: 'Высота изделия', type: 'number', unit: 'мм', defaultValue: 500, validation: { required: true, min: 10 } },
                { id: 'milling_length', category: 'advanced', label: 'Длина фрезеровки', type: 'number', unit: 'м', defaultValue: 0 },
            ], 
            workflow: [] 
        },
        { 
            id: 't2', name: 'Кухонный шкаф (параметрический)', description: 'Расчет стоимости кухонного шкафа по заданным размерам и фурнитуре.',
            industryGroup: 'PARAMETRIC', productType: 'STANDARD', tags: ['Мебель', 'Кухня', 'Параметрический'],
            rules: { vatIncluded: true, minQuantity: 1, approvalThresholds: { discountPercent: 20, marginPercent: 15 } }, 
            presets: [], 
            fields: [
                { id: 'width', category: 'basic', label: 'Ширина', type: 'number', unit: 'мм', defaultValue: 600, validation: { required: true, min: 300, max: 1200 } },
                { id: 'height', category: 'basic', label: 'Высота', type: 'number', unit: 'мм', defaultValue: 800, validation: { required: true, min: 400, max: 1000 } },
                { id: 'depth', category: 'basic', label: 'Глубина', type: 'number', unit: 'мм', defaultValue: 580, validation: { required: true, min: 300, max: 700 } },
                { id: 'facade_material', category: 'basic', label: 'Материал фасада', type: 'select', options: [{value: 'mdf', label: 'МДФ'}, {value: 'dsp', label: 'ДСП'}], defaultValue: 'mdf', validation: { required: true } },
                { id: 'has_handles', category: 'advanced', label: 'Наличие ручек', type: 'boolean', defaultValue: true },
            ], 
            workflow: [] 
        },
        { 
            id: 't3', name: 'Световой короб (односторонний)', description: 'Расчет простого светового короба с внутренней подсветкой.',
            industryGroup: 'ADVERTISING', productType: 'STANDARD', tags: ['Реклама', 'Светотехника', 'Короб'],
            rules: { vatIncluded: true, minQuantity: 1, approvalThresholds: { discountPercent: 10, marginPercent: 20 } }, 
            presets: [], 
            fields: [
                { id: 'width', category: 'basic', label: 'Ширина', type: 'number', unit: 'мм', defaultValue: 1000, validation: { required: true, min: 200 } },
                { id: 'height', category: 'basic', label: 'Высота', type: 'number', unit: 'мм', defaultValue: 500, validation: { required: true, min: 200 } },
                { id: 'depth', category: 'basic', label: 'Глубина', type: 'number', unit: 'мм', defaultValue: 130, validation: { required: true, min: 80, max: 200 } },
                { id: 'light_source', category: 'basic', label: 'Источник света', type: 'select', options: [{value: 'led_modules', label: 'LED модули'}, {value: 'led_strips', label: 'LED ленты'}], defaultValue: 'led_modules', validation: { required: true } },
            ], 
            workflow: [] 
        },
    ];

    return allTemplates.filter(t => t.productType === productType);
};


export function TemplateSelector({ productType, onSelect, onBack }: TemplateSelectorProps) {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<CalculationTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<CalculationTemplate[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryGroup | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CalculationTemplate | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setSelectedTemplate(null);
      try {
        const data = await fetchTemplatesAPI(productType);
        setTemplates(data);
        setFilteredTemplates(data);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast({ title: 'Ошибка загрузки шаблонов', description: 'Не удалось получить данные с сервера.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, [productType, toast]);

  useEffect(() => {
    let result = templates;
    if (selectedIndustry !== 'all') {
      result = result.filter(t => t.industryGroup === selectedIndustry);
    }
    if (searchTerm) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTemplates(result);
  }, [searchTerm, selectedIndustry, templates]);

  const handleSelect = (template: CalculationTemplate) => {
    setSelectedTemplate(template);
    // Задержка для визуального фидбека
    setTimeout(() => onSelect(template), 200);
  };

  const industryGroups = Array.from(new Set(templates.map(t => t.industryGroup)));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Шаг 1: Выбор шаблона</CardTitle>
            <CardDescription>
              Выберите подходящий шаблон для начала расчета.
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onBack}>Назад</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as any)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Отраслевая группа" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все группы</SelectItem>
              {industryGroups.map(group => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[450px] pr-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 ease-in-out ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
                  onClick={() => handleSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-base pr-2">{template.name}</h4>
                      {selectedTemplate?.id === template.id && <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">{template.industryGroup}</Badge>
                      {template.tags?.slice(0, 3).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <p>Шаблоны не найдены.</p>
                  <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
