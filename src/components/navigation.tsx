"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Package, 
  Settings, 
  BarChart3,
  Users,
  FileText,
  Wrench,
  ShoppingCart,
  DollarSign,
  Target,
  Calculator,
  ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/language-context"
import { LanguageSwitcher } from "./language-switcher"

export function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  
  const navigation = [
    { name: t.nav.dashboard, href: "/", icon: Home },
    { name: t.nav.materials, href: "/materials", icon: Package },
    { name: t.nav.workTypes, href: "/work-types", icon: Wrench },
    { name: "Товары", href: "/products", icon: ShoppingCart },
    { name: "Расчеты (в разработке)", href: "/calculations", icon: Calculator },
    // Временно скрыты до завершения разработки
    // { name: "Заказы", href: "/orders", icon: ClipboardList },
    // Калькулятор временно скрыт
    // { name: "Калькулятор заказов", href: "/calculator", icon: Calculator },
    { name: "Калькуляторы (в разработке)", href: "/formulas-test", icon: Calculator },
    { name: "Фонды", href: "/planning", icon: Target },
    { name: "Сотрудники", href: "/employees", icon: Users },
    // Временно скрыты до завершения разработки
    // { name: "Финансы", href: "/finance", icon: DollarSign },
    // { name: t.nav.analytics, href: "/analytics", icon: BarChart3 },
    // { name: t.nav.reports, href: "/reports", icon: FileText },
    // { name: t.nav.users, href: "/users", icon: Users },
    { name: t.nav.settings, href: "/settings", icon: Settings },
  ]

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">{t.app.name}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <nav className="px-3 pb-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
