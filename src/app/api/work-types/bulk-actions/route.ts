import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// POST /api/work-types/bulk-actions - выполнить массовые действия
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, itemIds, params = {} } = body

    // Валидация
    if (!action) {
      return NextResponse.json({
        success: false,
        message: 'Действие не указано'
      }, { status: 400 })
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Не выбраны элементы для действия'
      }, { status: 400 })
    }

    let result
    let message = ''

    switch (action) {
      case 'copy_simple':
        result = await copyWorkTypes(itemIds, {})
        message = `Скопировано ${result.count} вид(ов) работ`
        break

      case 'copy_to_department':
        if (!params.targetDepartment) {
          return NextResponse.json({
            success: false,
            message: 'Не указан целевой отдел'
          }, { status: 400 })
        }
        result = await copyWorkTypes(itemIds, { targetDepartment: params.targetDepartment })
        message = `Скопировано ${result.count} вид(ов) работ в другой отдел`
        break

      case 'copy_with_changes':
        result = await copyWorkTypes(itemIds, params)
        message = `Скопировано ${result.count} вид(ов) работ с изменениями`
        break

      case 'increase_rate_percent':
      case 'decrease_rate_percent':
        if (!params.percentage || isNaN(parseFloat(params.percentage))) {
          return NextResponse.json({
            success: false,
            message: 'Не указан корректный процент'
          }, { status: 400 })
        }
        result = await updateRates(itemIds, action, parseFloat(params.percentage))
        message = `Обновлены тарифы для ${result.count} вид(ов) работ`
        break

      case 'set_fixed_rate':
        if (!params.fixedRate || isNaN(parseFloat(params.fixedRate))) {
          return NextResponse.json({
            success: false,
            message: 'Не указана корректная ставка'
          }, { status: 400 })
        }
        result = await setFixedRate(itemIds, parseFloat(params.fixedRate))
        message = `Установлена ставка для ${result.count} вид(ов) работ`
        break

      case 'activate':
        result = await updateStatus(itemIds, true)
        message = `Активированы ${result.count} вид(ов) работ`
        break

      case 'deactivate':
        result = await updateStatus(itemIds, false)
        message = `Деактивированы ${result.count} вид(ов) работ`
        break

      case 'change_department':
        if (!params.newDepartment) {
          return NextResponse.json({
            success: false,
            message: 'Не указан новый отдел'
          }, { status: 400 })
        }
        result = await changeDepartment(itemIds, params.newDepartment)
        message = `Перемещены ${result.count} вид(ов) работ в другой отдел`
        break

      case 'delete_soft':
        result = await deleteWorkTypes(itemIds)
        message = `Удалены ${result.count} вид(ов) работ`
        break

      default:
        return NextResponse.json({
          success: false,
          message: 'Неизвестное действие'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message,
      data: result
    })

  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка выполнения массового действия'
    }, { status: 500 })
  }
}

// Вспомогательные функции

async function copyWorkTypes(itemIds: string[], params: any) {
  const originalWorkTypes = await prisma.workType.findMany({
    where: { id: { in: itemIds } }
  })

  const copies = originalWorkTypes.map(workType => {
    const copy: any = {
      name: `Копия ${workType.name}`,
      description: workType.description,
      unit: workType.unit,
      standardTime: workType.standardTime,
      hourlyRate: workType.hourlyRate,
      currency: workType.currency,
      skillLevel: workType.skillLevel,
      equipmentRequired: workType.equipmentRequired,
      safetyRequirements: workType.safetyRequirements,
      isActive: workType.isActive,
      departmentId: params.targetDepartment || workType.departmentId
    }

    // Применяем корректировку тарифа если указана
    if (params.rateAdjustmentType && params.rateAdjustmentValue) {
      const adjustment = parseFloat(params.rateAdjustmentValue)
      if (params.rateAdjustmentType === 'percent') {
        copy.hourlyRate = workType.hourlyRate * (1 + adjustment / 100)
      } else if (params.rateAdjustmentType === 'fixed') {
        copy.hourlyRate = adjustment
      }
    }

    return copy
  })

  const result = await prisma.workType.createMany({
    data: copies
  })

  return result
}

async function updateRates(itemIds: string[], action: string, percentage: number) {
  const multiplier = action === 'increase_rate_percent' 
    ? (1 + percentage / 100) 
    : (1 - percentage / 100)

  const result = await prisma.workType.updateMany({
    where: { id: { in: itemIds } },
    data: {
      hourlyRate: {
        multiply: multiplier
      }
    }
  })

  return result
}

async function setFixedRate(itemIds: string[], rate: number) {
  const result = await prisma.workType.updateMany({
    where: { id: { in: itemIds } },
    data: {
      hourlyRate: rate
    }
  })

  return result
}

async function updateStatus(itemIds: string[], isActive: boolean) {
  const result = await prisma.workType.updateMany({
    where: { id: { in: itemIds } },
    data: {
      isActive
    }
  })

  return result
}

async function changeDepartment(itemIds: string[], departmentId: string) {
  const result = await prisma.workType.updateMany({
    where: { id: { in: itemIds } },
    data: {
      departmentId
    }
  })

  return result
}

async function deleteWorkTypes(itemIds: string[]) {
  const result = await prisma.workType.deleteMany({
    where: { id: { in: itemIds } }
  })

  return result
}
