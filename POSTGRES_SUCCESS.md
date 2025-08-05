# ✅ PostgreSQL успешно настроен!

## 🎉 Текущий статус:

- ✅ **PostgreSQL установлен** и запущен через Homebrew
- ✅ **База данных `factoryflow_dev`** создана
- ✅ **Миграции применены** - все таблицы созданы
- ✅ **Тестовые данные загружены** (21 материал, 2 категории, 1 продукт)
- ✅ **Сервер разработки запущен** на http://localhost:3000
- ✅ **API работает** с PostgreSQL

## 🔗 Подключение:
```
DATABASE_URL="postgresql://bahtiarmingazov@localhost:5432/factoryflow_dev"
```

## 📊 Данные в базе:
- **Материалы**: 21 шт
- **Категории**: 2 шт  
- **Продукты**: 1 шт

## 🛠️ Полезные команды:

### Управление сервером разработки:
```bash
npm run dev                    # Запуск с PostgreSQL (.env.local)
```

### Управление базой данных:
```bash
npm run db:studio              # Открыть Prisma Studio
npm run db:migrate             # Применить новые миграции
npm run db:seed                # Добавить тестовые данные
```

### Переключение между базами:
```bash
./scripts/switch-db.sh         # Показать текущую конфигурацию
./scripts/switch-db.sh postgres # Переключиться на PostgreSQL
./scripts/switch-db.sh sqlite  # Переключиться на SQLite
```

### PostgreSQL сервис:
```bash
brew services start postgresql@15    # Запустить PostgreSQL
brew services stop postgresql@15     # Остановить PostgreSQL
brew services restart postgresql@15  # Перезапустить PostgreSQL
psql factoryflow_dev                  # Подключиться к БД
```

### Прямые SQL запросы:
```bash
psql factoryflow_dev -c "SELECT COUNT(*) FROM \"MaterialItem\";"
psql factoryflow_dev -c "SELECT name FROM \"Category\";"
psql factoryflow_dev -c "SELECT name, price FROM \"MaterialItem\" LIMIT 5;"
```

## 🌐 Проверка API:

```bash
# Материалы
curl http://localhost:3000/api/materials | jq 'length'

# Категории  
curl http://localhost:3000/api/categories | jq 'length'

# Продукты
curl http://localhost:3000/api/products | jq 'length'
```

## 📁 Файлы конфигурации:

- **`.env.local`** - PostgreSQL конфигурация (активная)
- **`.env`** - SQLite конфигурация (резервная)
- **`prisma/schema.prisma`** - PostgreSQL схема (активная)  
- **`prisma/schema.sqlite.prisma`** - SQLite схема (резервная)

## 🎯 Что дальше:

1. **Веб-интерфейс**: http://localhost:3000
2. **Prisma Studio**: `npm run db:studio`
3. **Разработка**: Все готово для работы с PostgreSQL
4. **Деплой**: Готов для продакшена с PostgreSQL

## 🆘 Помощь:

Если что-то не работает:
```bash
# Проверить статус PostgreSQL
brew services list | grep postgresql

# Перезапустить PostgreSQL
brew services restart postgresql@15

# Переподключиться к базе
npm run db:migrate
```
