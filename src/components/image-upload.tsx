'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ImageUploadProps {
  value?: string[]
  onChange?: (value: string[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB по умолчанию
  accept = 'image/*',
  disabled = false
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const currentImages = value || []

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return 'Файл должен быть изображением'
    }
    if (file.size > maxSize) {
      return `Размер файла не должен превышать ${maxSize / 1024 / 1024}MB`
    }
    return null
  }, [maxSize])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        if (currentImages.length >= maxFiles) {
          toast({
            variant: 'error',
            title: 'Превышен лимит файлов',
            description: `Максимальное количество файлов: ${maxFiles}`
          })
          break
        }

        const validationError = validateFile(file)
        if (validationError) {
          toast({
            variant: 'error',
            title: 'Ошибка валидации',
            description: validationError
          })
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Ошибка загрузки файла')
        }

        const data = await response.json()
        onChange?.([...currentImages, data.url])
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        variant: 'error',
        title: 'Ошибка загрузки',
        description: err.message
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentImages, disabled, maxFiles, validateFile, onChange, toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return

    const { files } = e.dataTransfer
    if (files?.length) {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = accept
      
      const dataTransfer = new DataTransfer()
      Array.from(files).forEach(file => dataTransfer.items.add(file))
      input.files = dataTransfer.files
      
      const event = new Event('change', { bubbles: true })
      input.dispatchEvent(event)
      handleChange({ target: input } as any)
    }
  }, [accept, disabled, handleChange])

  const removeImage = useCallback((index: number) => {
    onChange?.(currentImages.filter((_, i) => i !== index))
  }, [currentImages, onChange])

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled || uploading}
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Перетащите файлы сюда или кликните для выбора
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PNG, JPG или GIF до {maxSize / 1024 / 1024}MB
          </p>
          {uploading && (
            <p className="mt-2 text-sm text-blue-500">
              Загрузка...
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {currentImages.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0 relative">
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {maxFiles > 1 && (
        <div className="text-sm text-gray-500">
          {currentImages.length} из {maxFiles} изображений
        </div>
      )}
    </div>
  )
}
