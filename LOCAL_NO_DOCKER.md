# Local Run Without Docker

```bash
npm install
cp .env.example .env
npm run start:dev
```

The API listens on `PORT`, default `3101`.

This service does not run migrations. It expects the configured PostgreSQL database to already contain the `current`, `edge`, `history`, and `tag` tables.
