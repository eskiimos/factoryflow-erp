import { Metadata } from "next"
import { Dashboard } from "@/components/dashboard"

export const metadata: Metadata = {
  title: "FactoryFlow ERP - Система управления материалами",
  description: "Современная система управления материалами с интуитивным интерфейсом",
}

export default function HomePage() {
  return <Dashboard />
}
