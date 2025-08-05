'use client';

export default function ProductsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
          <p className="text-gray-600">
            Управление товарами и группами товаров
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <p>Страница товаров загружается...</p>
      </div>
    </div>
  );
}
