import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Аналитика - FactoryFlow ERP",
  description: "Аналитика и отчетность",
}

export default function Analytics() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Аналитика</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">Раздел аналитики в разработке</p>
          <p className="text-sm text-gray-400 mt-2">Скоро здесь будут детальные отчеты и графики</p>
        </div>
      </div>
    </div>
  )
}
