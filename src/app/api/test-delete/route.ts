import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  console.log('TEST DELETE endpoint called!')
  return NextResponse.json({ message: 'Test delete works' })
}
