import { Metadata } from "next"
import { MaterialsPage } from "@/components/materials-page"

export const metadata: Metadata = {
  title: "Материалы - FactoryFlow ERP",
  description: "Управление материалами и сырьем",
}

export default function Materials() {
  return <MaterialsPage />
}
