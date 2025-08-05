'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Star, StarOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProductImage {
  url: string;
  isMain: boolean;
  order: number;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast({
        variant: 'error',
        title: 'Ошибка загрузки',
        description: 'Некоторые файлы не являются изображениями или превышают 5MB'
      });
    }

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        
        onChange([
          ...images,
          {
            url,
            isMain: images.length === 0, // Первое изображение становится главным
            order: images.length,
          },
        ]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        variant: 'error',
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить изображения'
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // Если удалили главное изображение, делаем главным первое из оставшихся
    if (images[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    onChange(newImages);
  };

  const handleSetMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onChange(newImages);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Область загрузки */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Выберите файлы
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            или перетащите изображения сюда
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PNG, JPG, WebP до 5MB
          </p>
        </div>

        {/* Предпросмотр изображений */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={image.isMain ? 'default' : 'outline'}
                    onClick={() => handleSetMainImage(index)}
                  >
                    {image.isMain ? (
                      <Star className="h-4 w-4" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {image.isMain && (
                  <span className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                    Главное фото
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
