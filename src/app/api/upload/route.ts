import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads')

// Создаем папку uploads если её нет
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверяем размер файла (максимум 20MB)
    const MAX_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Размер файла превышает 20MB' },
        { status: 400 }
      )
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Неподдерживаемый формат файла. Используйте JPG, PNG или WEBP' },
        { status: 400 }
      )
    }

    // Получаем буфер файла
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Генерируем уникальное имя файла
    const fileId = uuidv4()
    const originalName = file.name.replace(/\.[^/.]+$/, '') // убираем расширение
    const webpFileName = `${Date.now()}-${fileId}-${originalName}.webp`
    const webpFilePath = path.join(UPLOADS_DIR, webpFileName)

    // Конвертируем в WebP с оптимизацией
    await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 85,
        effort: 4 
      })
      .toFile(webpFilePath)

    // Также создаем миниатюру
    const thumbnailFileName = `thumb-${webpFileName}`
    const thumbnailPath = path.join(UPLOADS_DIR, thumbnailFileName)
    
    await sharp(buffer)
      .resize(200, 200, { 
        fit: 'cover' 
      })
      .webp({ 
        quality: 80 
      })
      .toFile(thumbnailPath)

    // Получаем информацию о файле
    const stats = fs.statSync(webpFilePath)
    const metadata = await sharp(webpFilePath).metadata()

    return NextResponse.json({
      success: true,
      data: {
        filename: webpFileName,
        thumbnail: thumbnailFileName,
        url: `/uploads/${webpFileName}`,
        thumbnailUrl: `/uploads/${thumbnailFileName}`,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'Имя файла не указано' },
        { status: 400 }
      )
    }

    const filePath = path.join(UPLOADS_DIR, filename)
    const thumbnailPath = path.join(UPLOADS_DIR, `thumb-${filename}`)

    // Удаляем основной файл
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Удаляем миниатюру
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath)
    }

    return NextResponse.json({
      success: true,
      message: 'Файл удален'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении файла' },
      { status: 500 }
    )
  }
}
