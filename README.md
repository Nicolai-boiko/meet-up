# MeetUp — видео-конференции и обмен опытом

Vue 3, Express 5, PostgreSQL 17, Prisma 7, Socket.io, Tailwind CSS 4.

## Быстрый старт

```sh
git clone <repo-url> && cd meet-up
docker compose up -d
cp meetup-backend/.env.example meetup-backend/.env
npm install && cd meetup-backend && npm install
npm run db:generate && npm run db:migrate
npm run dev &                     # бэкенд → localhost:3000
cd .. && npm run dev              # фронтенд → localhost:5173
```

Если нет Docker — установи PostgreSQL, создай базу `meetup_db` и поправь `DATABASE_URL` в `.env`.

## Команды

```
npm run dev              # фронтенд (корень)
npm run dev              # бэкенд (meetup-backend/)
npm run db:migrate       # применить миграции
npm run db:push          # синхронизировать схему БД без миграций
npm run db:studio        # GUI для БД (Prisma Studio)
npm run build            # собрать фронтенд
```
