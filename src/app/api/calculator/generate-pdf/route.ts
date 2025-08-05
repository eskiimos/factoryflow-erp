import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { QuotePDF } from '@/components/quote-pdf'
import React from 'react'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Создаем JSX элемент
    const pdfComponent = React.createElement(QuotePDF, {
      orderNumber: data.orderNumber,
      date: data.date,
      company: data.company,
      customer: data.customer,
      items: data.items,
      materials: data.materials,
      workTypes: data.workTypes,
      additionalServices: data.additionalServices,
      totals: data.totals,
    })

    // Генерация PDF
    const stream = await renderToStream(pdfComponent)

    // Чтение stream в Buffer
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Отправка PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${data.orderNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
