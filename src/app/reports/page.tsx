import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Отчеты - FactoryFlow ERP",
  description: "Отчеты и документы",
}

export default function Reports() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Отчеты</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">Раздел отчетов в разработке</p>
          <p className="text-sm text-gray-400 mt-2">Здесь будут генерироваться отчеты по материалам</p>
        </div>
      </div>
    </div>
  )
}
