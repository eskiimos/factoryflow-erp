"use client"

import React from "react"

export default function PlanningPage({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Планирование</h1>
      <p className="text-gray-600 mb-4">Список активных категорий из БД:</p>
      <ul className="list-disc pl-5 space-y-1">
        {categories.map(cat => (
          <li key={cat.id} className="text-gray-800">{cat.name}</li>
        ))}
      </ul>
    </div>
  )
}
