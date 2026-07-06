# Развертывание базы данных

Инструкция описывает минимальный порядок подготовки PostgreSQL-базы для `drill-cloud-v3`: создать базу, применить схему, зарегистрировать буровую и проверить ingest.

## Требования

- PostgreSQL с расширением TimescaleDB.
- Консольная утилита `psql`.
- Доступ к роли, которая может создавать БД, расширения и таблицы.
- Открытая интерактивная сессия `psql`.

Пример входа в `psql`:

```bash
psql -U postgres -W postgres
```

## 1. Создать базу

Если база уже создана, шаг можно пропустить.

Команды выполняются внутри `psql`:

```sql
SELECT current_database();

CREATE DATABASE "cloud-beta-dev";

\c cloud-beta-dev

SELECT current_database();
```

## 2. Применить базовую миграцию

Базовая схема лежит в:

```text
migrations/0000_cloud_beta_schema.sql
```

Она создает:

- `edge` - справочник буровых;
- `tag` - справочник тегов;
- `current` - последние значения тегов;
- `history` - история числовых значений;
- `camera` - видеопотоки буровых;
- индексы и первичные ключи;
- TimescaleDB hypertable для `history`.

Внутри `psql` применяем файл через `\i`:

```sql
\i 'C:/Users/myart/Drill/cloud/migrations/0000_cloud_beta_schema.sql'
```

Важно: внутри `psql` для Windows-путей используем `/`, а не `\`. Иначе `\Users` будет воспринято как psql-команда.

Проверка:

```sql
\dt public.*

SELECT hypertable_schema, hypertable_name
FROM timescaledb_information.hypertables;
```

Ожидаемо среди таблиц есть `edge`, `tag`, `current`, `history`, `camera`, а `history` отображается как hypertable.

## 3. Зарегистрировать буровую

Минимальная запись в `edge`:

```sql
INSERT INTO edge (id, name, parent_id)
VALUES ('edge-demo', 'Демо буровая', NULL)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id;
```

Проверка:

```sql
SELECT id, name, parent_id
FROM edge
ORDER BY name;
```

## 4. Зарегистрировать теги

Тег должен быть в таблице `tag`, если UI должен показывать русское имя, единицу измерения и метаданные.

Минимальный пример:

```sql
INSERT INTO tag (
  id,
  name,
  min,
  max,
  comment,
  unit_of_measurement,
  precision,
  tag_group
)
VALUES (
  'BN1_10V_ControlVoltage_Fault',
  'Ошибка контрольного напряжения 10В',
  NULL,
  NULL,
  '',
  '',
  0,
  'Электрика'
)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  min = EXCLUDED.min,
  max = EXCLUDED.max,
  comment = EXCLUDED.comment,
  unit_of_measurement = EXCLUDED.unit_of_measurement,
  precision = EXCLUDED.precision,
  tag_group = EXCLUDED.tag_group;
```

Важно:

- `tag.id` должен совпадать с `tag`, который приходит в ingest.
- `tag.name` используется как основное имя в UI.
- `unit_of_measurement` отображается рядом со значением.
- `min` и `max` используются для статусов/границ, если они заданы.

## 5. Зарегистрировать камеры

Камеры хранятся в `camera`.

Пример:

```sql
INSERT INTO camera (edge, protocol, source)
VALUES ('edge-demo', 'wss', 'beta.video.drill.greact.ru/ws')
ON CONFLICT (edge, protocol, source) DO NOTHING;
```

Проверка:

```sql
SELECT edge, protocol, source
FROM camera
ORDER BY edge, source;
```

## 6. Настроить backend

В `.env` backend-сервиса указать целевую БД:

```env
DATABASE_URL=postgresql://user:password@host:5432/cloud-beta-dev
INGEST_API_KEY=secret-key
PORT=3101
```

Запуск локально:

```bash
npm install
npm run start:dev
```

## 7. Smoke-test ingest

Отправить числовое значение:

```bash
curl -X POST "http://localhost:3101/api/ingest" \
  -H "content-type: application/json" \
  -H "x-api-key: secret-key" \
  -d '{"edge":"edge-demo","tag":"BN1_10V_ControlVoltage_Fault","timestamp":"2026-07-06T10:00:00.000Z","value":0}'
```

Проверить `current`:

```bash
curl "http://localhost:3101/api/current?edge=edge-demo"
```

Проверить БД внутри `psql`:

```sql
SELECT edge, tag, value, "updatedAt"
FROM current
WHERE edge = 'edge-demo';
```

## 8. Поведение `NULL`

Ingest принимает явный `null`:

```json
{
  "edge": "edge-demo",
  "tag": "BN1_10V_ControlVoltage_Fault",
  "timestamp": "2026-07-06T10:00:00.000Z",
  "value": null
}
```

Правила:

- `current.value` обновляется в `NULL`;
- в `history` такая точка не пишется;
- на фронтенде current-виджет показывает `NULL` как `—`;
- `0` остается обычным числом и не считается `NULL`.

## 9. Короткая проверка после развертывания

```bash
curl "http://localhost:3101/api/health"
curl "http://localhost:3101/api/edge"
curl "http://localhost:3101/api/current?edge=edge-demo"
curl "http://localhost:3101/api/camera?edge=edge-demo"
```

Если эти запросы отвечают корректно, база готова для работы backend и UI.