import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get basic product counts
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });
    
    // Get products with stock information
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        totalCost: true,
        margin: true,
        currentStock: true,
        minStock: true,
        currency: true,
      }
    });
    
    // Calculate total value (based on current stock * total cost)
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * product.totalCost);
    }, 0);
    
    // Calculate low stock count
    const lowStockProducts = products.filter(product => 
      product.currentStock <= product.minStock
    ).length;
    
    // Calculate average margin
    const avgMargin = products.length > 0 
      ? products.reduce((sum, product) => sum + product.margin, 0) / products.length
      : 0;
    
    // Find top selling product (placeholder - would need sales data)
    const topSellingProduct = products.length > 0 
      ? products.reduce((prev, current) => 
          prev.sellingPrice > current.sellingPrice ? prev : current
        ).name
      : 'N/A';
    
    const stats = {
      totalProducts,
      activeProducts,
      totalValue,
      lowStockProducts,
      averageMargin: avgMargin,
      topSellingProduct,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}
