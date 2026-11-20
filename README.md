# Kospet.uz — интернет-магазин часов (React + SCSS + Firebase)

## Запуск
1. `npm install`
2. Создайте проект в Firebase: включите **Firestore**, **Authentication (Email/Password)**, **Storage**.
3. Скопируйте `.env.example` в `.env` и вставьте ключи веб-приложения.
4. Правила: вставьте `firestore.rules` и `storage.rules` в консоли Firebase (или `firebase deploy --only firestore:rules,storage`).
5. Создайте пользователя в Authentication, затем в Firestore — документ `admins/{UID этого пользователя}` (любое поле, например `role: "admin"`).
6. `npm run dev` → магазин на `/`, админка на `/admin`. В админке «Товары → Загрузить демо-товары».

## Структура
- `src/lib/db.js` — весь доступ к Firestore (товары, заказы, статусы). Бот будет использовать те же коллекции.
- `src/lib/store.jsx` — тема, корзина, избранное (localStorage), товары в реальном времени.
- `src/lib/seo.js` — title/description/OG/canonical/JSON-LD (Product) на каждой странице.
- `src/pages/` — Shop, Product, Account (Избранное + Корзина/оформление), Admin (заказы + товары).

## Заказы
`orders/{id}`: `name, phone, address, comment, items[{id,name,price,qty}], total, status (new|confirmed|shipped|done|cancelled), source ('web'|'telegram'), telegram.notified, createdAt`.

## Что готово под SEO (следующий этап)
- `robots.txt`, canonical, OG, JSON-LD Product, семантичная вёрстка, `lang="ru"`.
- Для индексации SPA-страниц добавьте пререндер (например `vite-plugin-prerender` или Firebase Hosting + Cloud Function) и `sitemap.xml` из коллекции `products`. Замените `your-domain.uz` в `public/robots.txt` и `.env`.

## Что готово под Telegram-бота
- `functions/index.js` — уведомление админу о каждом новом заказе (нужен тариф Blaze и секреты `BOT_TOKEN`, `ADMIN_CHAT_ID`).
- Бот сможет читать `products` и писать в `orders` с `source: 'telegram'` без изменений сайта.
# Cospet-uz
# Cospet-uz
# Cospet-uz
