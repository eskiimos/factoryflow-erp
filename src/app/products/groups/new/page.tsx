import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Новая группа товаров - FactoryFlow ERP",
  description: "Создание новой группы товаров",
}

export default function NewProductGroup() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Создать группу товаров</h1>
          <p className="text-muted-foreground">Добавление новой группы для организации товаров</p>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <p className="text-center text-muted-foreground">
            Форма создания группы товаров будет реализована позже
          </p>
        </div>
      </div>
    </div>
  )
}
