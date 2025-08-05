import { Metadata } from "next"
import { SettingsPage } from "@/components/settings-page"

export const metadata: Metadata = {
  title: "Настройки - FactoryFlow ERP",
  description: "Настройки системы",
}

export default function Settings() {
  return <SettingsPage />
}
