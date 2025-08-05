import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Пользователи - FactoryFlow ERP",
  description: "Управление пользователями системы",
}

export default function Users() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Пользователи</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">Раздел пользователей в разработке</p>
          <p className="text-sm text-gray-400 mt-2">Управление ролями и правами доступа</p>
        </div>
      </div>
    </div>
  )
}
