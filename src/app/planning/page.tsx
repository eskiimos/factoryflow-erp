import { Metadata } from 'next'
import PlanningPageSimple from '@/components/planning/planning-page-simple'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Фонды - FactoryFlow ERP',
  description: 'Управление фондами, бюджетом и ресурсами предприятия',
}

export default async function PlanningPageRoute() {
  // Fetch active categories from database
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })
  
  // Fetch departments for payroll planning
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })
  
  return <PlanningPageSimple categories={categories} />
}
