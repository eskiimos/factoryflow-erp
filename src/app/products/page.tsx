import { Metadata } from "next"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Download, Upload, Settings, Package, FolderOpen } from "lucide-react"
import Link from "next/link"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"

// Ленивая загрузка тяжелых компонентов
const SimpleProductsTable = dynamic(() => import("@/components/simple-products-table").then(mod => ({ default: mod.SimpleProductsTable })), {
  loading: () => <div className="flex justify-center items-center h-32">Загрузка товаров...</div>
})

const ProductGroupsSection = dynamic(() => import("@/components/product-groups-section").then(mod => ({ default: mod.ProductGroupsSection })), {
  loading: () => <div className="flex justify-center items-center h-32">Загрузка групп...</div>
})

export const metadata: Metadata = {
  title: "Товары - FactoryFlow ERP",
  description: "Управление товарами и готовой продукцией",
}

export default function Products() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header - Fixed Height */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border/10 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Товары
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Управление товарами и готовой продукцией
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="products" className="h-full flex flex-col">
          {/* Tabs Navigation */}
          <div className="flex-shrink-0 px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Товары
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Группы
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 px-6 py-4 min-h-0">
            <TabsContent value="products" className="h-full m-0">
              <BentoGrid className="h-full">
                <BentoCard size="2x2" className="col-span-full h-full p-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-border/10 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Список товаров</h3>
                        <p className="text-sm text-muted-foreground">Все товары в системе</p>
                      </div>
                      <Link href="/products/new">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить товар
                        </Button>
                      </Link>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <SimpleProductsTable />
                    </div>
                  </div>
                </BentoCard>
              </BentoGrid>
            </TabsContent>

            <TabsContent value="groups" className="h-full m-0">
              <BentoGrid className="h-full">
                <BentoCard size="2x2" className="col-span-full h-full p-0 overflow-hidden">
                  <ProductGroupsSection />
                </BentoCard>
              </BentoGrid>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
