# drill-cloud-v3

Lightweight Drill Cloud API for an existing PostgreSQL/TimescaleDB database.

## What is intentionally absent

- No `tag-translation` module.
- No alarm log writes.
- No automatic `edge` or `tag` upserts during ingest.

## Database

Database deployment, edge registration and migrations are described in [DATABASE_DEPLOYMENT.md](./DATABASE_DEPLOYMENT.md).

The current `cloud` database schema uses these public tables:

- `edge(id, name, parent_id)`
- `tag(id, name, min, max, comment, unit_of_measurement, precision, tag_group)`
- `current(id, edge, tag, value, createdAt, updatedAt)`
- `history(edge, timestamp, tag, value, createdAt)`
- `camera(edge, protocol, source)`

`history` is expected to be a TimescaleDB hypertable partitioned by `timestamp`.

## API

All routes are served under the `/api` prefix.

- `GET /api/health`
- `GET /api/edge`
- `GET /api/tag?edge=edge5&search=pressure`
- `GET /api/current?edge=edge5&tags=tag1,tag2`
- `GET /api/history?edge=edge5&tags=tag1,tag2&from=2026-06-01T00:00:00Z&to=2026-06-02T00:00:00Z`
- `GET /api/camera?edge=edge5`
- `POST /api/ingest`
- `POST /api/ingest/:edge`

`POST /api/ingest` accepts one point:

```json
{
  "edge": "edge5",
  "tag": "hook_weight_1",
  "timestamp": "2026-06-19T00:00:00Z",
  "value": 12.34
}
```

`value` may be `null`. In that case `current` is updated, but `history` is not.

`POST /api/ingest/:edge` accepts a compact edge payload:

```json
{
  "timestamp": "2026-06-19T00:00:00Z",
  "values": {
    "hook_weight_1": 12.34,
    "rotary_rpm": 80
  }
}
```

## Local Run

```bash
npm install
cp .env.example .env
npm run start:dev
```

The default port is `3101`.
