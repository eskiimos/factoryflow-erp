'use client'

import { Upload } from 'lucide-react'

interface ImageUploadProps {
  imageFile?: File | null
  setImageFile?: (file: File | null) => void
  imagePreview?: string | null
  setImagePreview?: (url: string | null) => void
  maxSize?: number
  aspectRatio?: number
  value?: any[]
  onChange?: (files: any[]) => void
  accept?: string
  multiple?: boolean
}

export function ImageUpload(props: ImageUploadProps) {
  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Компонент загрузки изображений в разработке
        </p>
      </div>
    </div>
  )
}
