import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware для ограничения доступа к функционалу калькулятора
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Список запрещенных путей
  const restrictedPaths = [
    '/calculator',
    '/calculator/component',
    '/calculator/linear',
    '/orders/calculator',
  ]

  // Проверяем, является ли текущий путь запрещенным
  const isRestricted = restrictedPaths.some(path => 
    pathname.startsWith(path)
  )

  // Если путь запрещен, редиректим на страницу с уведомлением
  if (isRestricted) {
    return NextResponse.redirect(new URL('/calculator-unavailable', request.url))
  }

  // Продолжаем обработку запроса
  return NextResponse.next()
}

// Конфигурация middleware - указываем пути для которых она должна выполняться
export const config = {
  matcher: [
    '/calculator/:path*',
    '/orders/calculator/:path*',
  ],
}
