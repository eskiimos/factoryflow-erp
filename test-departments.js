import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testDepartments() {
  try {
    console.log("Testing departments API...")
    
    const departments = await prisma.department.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            workTypes: true,
            employees: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log("Departments found:", departments.length)
    console.log("First department:", departments[0])
    
    return departments
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testDepartments().catch(console.error)
