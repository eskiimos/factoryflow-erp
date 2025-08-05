# ⚡ Мгновенное развертывание FactoryFlow ERP

## 🚀 Автоматический запуск (1 команда)

```bash
./deploy.sh
```

## 🌐 Или ручные шаги:

### 1. Установка и запуск
```bash
npm install
npm run dev
```

### 2. Открыть формулы
```
http://localhost:3000/test-formulas
```

### 3. Развертывание в облаке

#### Создать PostgreSQL базу:
1. Зайти на https://console.neon.tech
2. Создать новую базу данных
3. Скопировать connection string

#### Настроить Vercel:
```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть
vercel --prod

# Добавить переменные окружения в Vercel dashboard:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

#### Запустить миграции:
```bash
npx prisma migrate deploy
```

## ✅ Готово! 

ERP система полностью развернута и готова к использованию:

- 📊 Конструктор формул
- 🏭 Управление производством  
- 💰 Финансовая отчетность
- 📦 Управление заказами
- 👥 Управление сотрудниками

---

**Все работает из коробки!** 🎉
