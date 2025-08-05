// Типы данных
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
  category: {
    id: string
    name: string
  }
  defaultMaterials: Array<{
    material: Material
    quantity: number
  }>
  defaultWorkTypes: Array<{
    workType: WorkType
    quantity: number
  }>
  defaultFunds: Array<{
    fund: Fund
    percentage: number
  }>
}

export type Configuration = {
  id: string
  name: string
  productId: string
  product: Product
  totalPrice: number
  materials: Array<{
    material: Material
    quantity: number
    price: number
  }>
  workTypes: Array<{
    workType: WorkType
    quantity: number
    price: number
  }>
  funds: Array<{
    fund: Fund
    percentage: number
  }>
}

// API функции
export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/calculator/products')
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  return response.json()
}

export async function getConfigurations(): Promise<Configuration[]> {
  const response = await fetch('/api/calculator/configurations')
  if (!response.ok) {
    throw new Error('Failed to fetch configurations')
  }
  return response.json()
}

export async function getConfiguration(id: string): Promise<Configuration> {
  const response = await fetch(`/api/calculator/configurations/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch configuration')
  }
  return response.json()
}

export async function saveConfiguration(data: Omit<Configuration, 'id'>): Promise<Configuration> {
  const response = await fetch('/api/calculator/configurations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to save configuration')
  }
  return response.json()
}

export async function updateConfiguration(id: string, data: Omit<Configuration, 'id'>): Promise<Configuration> {
  const response = await fetch(`/api/calculator/configurations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update configuration')
  }
  return response.json()
}

export async function deleteConfiguration(id: string): Promise<void> {
  const response = await fetch(`/api/calculator/configurations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete configuration')
  }
}

export async function generatePDF(data: {
  orderNumber: string
  date: string
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
  customer?: {
    name: string
    address: string
    phone?: string
    email?: string
  }
  items: Array<{
    name: string
    description?: string
    quantity: number
    price: number
    total: number
  }>
  materials?: Array<{
    name: string
    quantity: number
    unit: string
    price: number
  }>
  workTypes?: Array<{
    name: string
    quantity: number
    unit: string
    price: number
  }>
  additionalServices: Array<{
    name: string
    price: number
  }>
  totals: {
    subtotal: number
    servicesTotal: number
    vat: number
    total: number
  }
}): Promise<Blob> {
  const response = await fetch('/api/calculator/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to generate PDF')
  }
  
  return response.blob()
}
