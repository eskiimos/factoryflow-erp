import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer'

// Регистрация шрифта
Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf'
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  logo: {
    width: 120
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'right'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10
  },
  table: {
    marginTop: 10,
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10
  },
  tableCellSmall: {
    flex: 0.5,
    padding: 5,
    fontSize: 10
  },
  tableCellLarge: {
    flex: 2,
    padding: 5,
    fontSize: 10
  },
  total: {
    marginTop: 20,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666'
  }
})

type QuoteProps = {
  orderNumber: string
  date: string
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
  customer?: {
    name: string
    address: string
    phone?: string
    email?: string
  }
  items: Array<{
    name: string
    description?: string
    quantity: number
    price: number
    total: number
  }>
  materials?: Array<{
    name: string
    quantity: number
    unit: string
    price: number
  }>
  workTypes?: Array<{
    name: string
    quantity: number
    unit: string
    price: number
  }>
  additionalServices: Array<{
    name: string
    price: number
  }>
  totals: {
    subtotal: number
    servicesTotal: number
    vat: number
    total: number
  }
}

export function QuotePDF({
  orderNumber,
  date,
  company,
  customer,
  items,
  materials,
  workTypes,
  additionalServices,
  totals
}: QuoteProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Шапка */}
        <View style={styles.header}>
          <Image
            src="/logo.png"
            style={styles.logo}
          />
          <View style={styles.companyInfo}>
            <Text>{company.name}</Text>
            <Text>{company.address}</Text>
            <Text>{company.phone}</Text>
            <Text>{company.email}</Text>
          </View>
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>Коммерческое предложение</Text>
        <Text style={styles.subtitle}>№{orderNumber} от {date}</Text>

        {/* Данные клиента */}
        {customer && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.subtitle}>Клиент:</Text>
            <Text>{customer.name}</Text>
            <Text>{customer.address}</Text>
            {customer.phone && <Text>{customer.phone}</Text>}
            {customer.email && <Text>{customer.email}</Text>}
          </View>
        )}

        {/* Товары */}
        <Text style={styles.subtitle}>Товары и услуги:</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellSmall}>№</Text>
            <Text style={styles.tableCellLarge}>Наименование</Text>
            <Text style={styles.tableCell}>Кол-во</Text>
            <Text style={styles.tableCell}>Цена</Text>
            <Text style={styles.tableCell}>Сумма</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellSmall}>{index + 1}</Text>
              <Text style={styles.tableCellLarge}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>{item.price.toLocaleString()} ₽</Text>
              <Text style={styles.tableCell}>{item.total.toLocaleString()} ₽</Text>
            </View>
          ))}
        </View>

        {/* Материалы */}
        {materials && materials.length > 0 && (
          <>
            <Text style={styles.subtitle}>Материалы:</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellLarge}>Наименование</Text>
                <Text style={styles.tableCell}>Кол-во</Text>
                <Text style={styles.tableCell}>Ед.изм.</Text>
                <Text style={styles.tableCell}>Цена</Text>
              </View>
              {materials.map((material, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellLarge}>{material.name}</Text>
                  <Text style={styles.tableCell}>{material.quantity}</Text>
                  <Text style={styles.tableCell}>{material.unit}</Text>
                  <Text style={styles.tableCell}>{material.price.toLocaleString()} ₽</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Работы */}
        {workTypes && workTypes.length > 0 && (
          <>
            <Text style={styles.subtitle}>Виды работ:</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellLarge}>Наименование</Text>
                <Text style={styles.tableCell}>Кол-во</Text>
                <Text style={styles.tableCell}>Ед.изм.</Text>
                <Text style={styles.tableCell}>Цена</Text>
              </View>
              {workTypes.map((work, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellLarge}>{work.name}</Text>
                  <Text style={styles.tableCell}>{work.quantity}</Text>
                  <Text style={styles.tableCell}>{work.unit}</Text>
                  <Text style={styles.tableCell}>{work.price.toLocaleString()} ₽</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Дополнительные услуги */}
        {additionalServices.length > 0 && (
          <>
            <Text style={styles.subtitle}>Дополнительные услуги:</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCellLarge}>Наименование</Text>
                <Text style={styles.tableCell}>Цена</Text>
              </View>
              {additionalServices.map((service, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellLarge}>{service.name}</Text>
                  <Text style={styles.tableCell}>{service.price.toLocaleString()} ₽</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Итоги */}
        <View style={styles.total}>
          <Text>Товары и работы: {totals.subtotal.toLocaleString()} ₽</Text>
          {totals.servicesTotal > 0 && (
            <Text>Дополнительные услуги: {totals.servicesTotal.toLocaleString()} ₽</Text>
          )}
          {totals.vat > 0 && (
            <Text>НДС 20%: {totals.vat.toLocaleString()} ₽</Text>
          )}
          <Text style={{ marginTop: 10 }}>
            Итого к оплате: {totals.total.toLocaleString()} ₽
          </Text>
        </View>

        {/* Подвал */}
        <Text style={styles.footer}>
          Предложение действительно в течение 14 дней с даты формирования
        </Text>
      </Page>
    </Document>
  )
}
