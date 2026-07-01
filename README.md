# drill-cloud-v3

Lightweight Drill Cloud API for an existing PostgreSQL/TimescaleDB database.

## What is intentionally absent

- No migrations.
- No `tag-translation` module.
- No alarm log writes.
- No automatic `edge` or `tag` upserts during ingest.

## Database

The current `cloud` database schema uses these public tables:

- `edge(id, name, parent_id, tag_ids)`
- `tag(id, name, min, max, comment, unit_of_measurement, edge_ids, precision, tag_group)`
- `current(id, edge, tag, value, createdAt, updatedAt)`
- `history(id, edge, timestamp, tag, value, createdAt)`

`history` is expected to be a TimescaleDB hypertable partitioned by `timestamp`.
Historical chart ranges use continuous aggregates:

- `history_1m`
- `history_5m`
- `history_1h`
- `history_1d`

## API

- `GET /health`
- `GET /edge`
- `GET /tag?edge=edge5&search=pressure`
- `GET /current?edge=edge5&tags=tag1,tag2`
- `GET /history?edge=edge5&tags=tag1,tag2&from=2026-06-01T00:00:00Z&to=2026-06-02T00:00:00Z`
- `POST /ingest`
- `POST /ingest/:edge`

`POST /ingest` accepts one point:

```json
{
  "edge": "edge5",
  "tag": "hook_weight_1",
  "timestamp": "2026-06-19T00:00:00Z",
  "value": 12.34
}
```

`POST /ingest/:edge` accepts a compact edge payload:

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
