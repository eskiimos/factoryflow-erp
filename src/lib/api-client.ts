// API клиент для работы с продуктами, материалами, работами и конфигурациями

export type Material = {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
}

export type WorkType = {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
}

export type Fund = {
  id: string
  name: string
  percentage: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

export type ProductConfiguration = {
  id?: string
  productId: string
  materials: Material[]
  workTypes: WorkType[]
  funds: Fund[]
  totalPrice: number
  createdAt?: Date
  updatedAt?: Date
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api'
  }

  // Загрузка списка продуктов
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки продуктов')
    }
    return response.json()
  }

  // Загрузка материалов по ID продукта
  async getMaterials(productId: string): Promise<Material[]> {
    const response = await fetch(`${this.baseUrl}/products/${productId}/materials`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки материалов')
    }
    return response.json()
  }

  // Загрузка работ по ID продукта
  async getWorkTypes(productId: string): Promise<WorkType[]> {
    const response = await fetch(`${this.baseUrl}/products/${productId}/work-types`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки работ')
    }
    return response.json()
  }

  // Загрузка фондов накладных расходов
  async getFunds(): Promise<Fund[]> {
    const response = await fetch(`${this.baseUrl}/funds`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки фондов')
    }
    return response.json()
  }

  // Сохранение конфигурации продукта
  async saveConfiguration(config: ProductConfiguration): Promise<ProductConfiguration> {
    const response = await fetch(`${this.baseUrl}/configurations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    if (!response.ok) {
      throw new Error('Ошибка сохранения конфигурации')
    }
    return response.json()
  }

  // Загрузка сохраненной конфигурации
  async getConfiguration(id: string): Promise<ProductConfiguration> {
    const response = await fetch(`${this.baseUrl}/configurations/${id}`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки конфигурации')
    }
    return response.json()
  }

  // Загрузка списка сохраненных конфигураций
  async getConfigurations(): Promise<ProductConfiguration[]> {
    const response = await fetch(`${this.baseUrl}/configurations`)
    if (!response.ok) {
      throw new Error('Ошибка загрузки конфигураций')
    }
    return response.json()
  }
}

export const api = new ApiClient()
