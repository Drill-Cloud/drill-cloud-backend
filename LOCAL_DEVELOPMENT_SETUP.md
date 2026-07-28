# Локальный контур edge + cloud + UI

Инструкция как поднять локально `Node-RED edge`, `mqtt-ingest`, `cloud` и `ui`, увидеть live-данные и проверить основные кейсы разработки.

## Что получится

- Node-RED публикует demo-данные в MQTT broker `mqtt://194.36.208.86:1883`.
- Локальный `mqtt-ingest` читает demo-топики и отправляет данные в локальный `cloud`.
- Локальный `cloud` пишет в БД `cloud-beta-dev` и отдает API на `http://localhost:3101`.
- Локальный `ui` работает на `http://localhost:5173`.
- Быстрый локальный режим запускается без Keycloak. RBAC проверяется отдельно через SSO.

## 1. Предварительно установить

1. Node.js 22.
2. Git.
3. PostgreSQL tools / pgAdmin / `psql`.
4. Для видео-эмулятора: `ffmpeg` и локальный RTSP-сервер, например MediaMTX.

Проверка:

```bash
node -v
npm -v
git --version
```

## 2. Клонировать репозитории

```bash
cd C:\Users\<user>\Drill

git clone https://git.greact.ru/APervov/cloud-v3.git cloud
git clone https://git.greact.ru/APervov/ui.git ui
git clone https://git.greact.ru/NBizyaev/mqtt-ingest.git mqtt-ingest
git clone https://git.greact.ru/NBizyaev/node-red-edge-local-setup.git node-red-edge-local-setup
```

Проект `nodered-edge5` удобнее подключать через UI Node-RED, потому что он живет как Node-RED project.

## 3. База данных

### Быстрый вариант

Для обычной разработки используем готовую dev-БД:

```env
DATABASE_URL=postgres://greact:pG3526l4@194.36.208.86:5433/cloud-beta-dev
```

Это самый быстрый путь для проверки UI, live SSE графика, mqtt-ingest и Node-RED эмуляторов.

### Своя БД, когда нужна изоляция

Открыть `psql`:

```bash
psql -U postgres
```

Внутри `psql`:

```sql
CREATE DATABASE "cloud-local";
\c cloud-local
\i 'C:/Users/<user>/Drill/cloud/migrations/0000_cloud_beta_schema.sql'
```

Минимально зарегистрировать demo-буровую:

```sql
INSERT INTO edge (id, name)
VALUES ('demo', 'Demo edge')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
```

Для боевого набора тегов удобнее использовать dev-БД или подготовленный SQL seed.

### Наполнить справочники после миграции

После применения `migrations/0000_cloud_beta_schema.sql` база содержит только схему. Чтобы UI начал показывать буровую, теги и видео, нужно заполнить справочники `edge`, `tag` и `camera`.

Минимальная буровая:

```sql
INSERT INTO edge (id, name, parent_id)
VALUES ('demo', 'Demo edge', NULL)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id;
```

Минимальный тег:

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

- `tag.id` должен совпадать с `tag`, который приходит в ingest;
- `tag.name` отображается в UI как основное русское имя;
- `unit_of_measurement` показывается рядом со значением;
- `min`, `max`, `precision`, `tag_group` используются виджетами и графиками, если заполнены.

Минимальная камера:

```sql
INSERT INTO camera (edge, name, protocol, source)
VALUES ('demo', 'Demo video', 'ws', 'localhost:9090/my-super-video')
ON CONFLICT (edge, protocol, source) DO NOTHING;
```

Проверка справочников:

```sql
SELECT id, name, parent_id FROM edge ORDER BY name;
SELECT id, name, unit_of_measurement, tag_group FROM tag ORDER BY id;
SELECT edge, name, protocol, source FROM camera ORDER BY edge, source;
```

### Smoke-test ingest для своей БД

После запуска `cloud` можно проверить запись в `current` и `history` через ingest:

```bash
curl -X POST "http://localhost:3101/api/ingest" \
  -H "content-type: application/json" \
  -H "x-api-key: dev-local-key" \
  -d '{"edge":"demo","tag":"BN1_10V_ControlVoltage_Fault","timestamp":"2026-07-06T10:00:00.000Z","value":0}'
```

Проверить API:

```bash
curl "http://localhost:3101/api/current?edge=demo"
curl "http://localhost:3101/api/camera?edge=demo"
```

Проверить БД:

```sql
SELECT edge, tag, value, "updatedAt"
FROM current
WHERE edge = 'demo';
```

Для `NULL`-значений правило такое:

- `current.value` обновляется в `NULL`;
- в `history` такая точка не пишется;
- на фронтенде current-виджет показывает `NULL` как `—`;
- `0` остается обычным числом и не считается `NULL`.

## 4. Cloud

```bash
cd C:\Users\<user>\Drill\cloud
npm install
```

Создать `.env`:

```env
PORT=3101
DATABASE_URL=postgres://greact:pG3526l4@194.36.208.86:5433/cloud-beta-dev
CORS_ALLOWED_ORIGINS=http://localhost:5173
INGEST_API_KEY=dev-local-key
PG_POOL_MAX=20
CURRENT_EVENTS_POLL_MS=1000

# Быстрый локальный режим без SSO.
KEYCLOAK_AUTH_DISABLED=true
```

Запуск:

```bash
npm run start:dev
```

Проверка:

```bash
curl http://localhost:3101/api/edge
```

## 5. UI

```bash
cd C:\Users\<user>\Drill\ui
npm install
```

Создать `.env`:

```env
BRANCH=
DEV_API_URL=http://localhost:3101
VITE_DIAGRAM_API_URL=
VITE_TOIR_LIGHT_ORIGIN=https://toir-light.greact.ru

# Для быстрого локального режима Keycloak можно не включать.
VITE_KEYCLOAK_URL=
VITE_KEYCLOAK_REALM=
VITE_KEYCLOAK_CLIENT_ID=
```

Запуск:

```bash
npm run dev
```

Открыть:

```text
http://localhost:5173
```

## 6. mqtt-ingest

`mqtt-ingest` связывает MQTT broker и локальный `cloud`.

```bash
cd C:\Users\<user>\Drill\mqtt-ingest\app
npm install
```

По умолчанию для общего demo-контура используется удаленный broker:

```env
MQTT_URL=mqtt://194.36.208.86:1883
```

Если нужно проверить все полностью локально, можно поднять локальный Mosquitto:

```bash
mosquitto -p 1883 -v
```

Тогда в `.env` для `mqtt-ingest` и в Node-RED нужно использовать:

```env
MQTT_URL=mqtt://localhost:1883
```

Создать `.env`:

```env
MQTT_URL=mqtt://194.36.208.86:1883
HTTP_PORT=8080
WS_PORT=9090

# В локальной разработке оба потока отправляем в локальный cloud-dev,
# а не в продовый backend.
CLOUD_INGEST_URL=http://localhost:3101/api/ingest
DEMO_CLOUD_INGEST_URL=http://localhost:3101/api/ingest
CLOUD_INGEST_API_KEY=dev-local-key
```

Запуск в dev-режиме:

```bash
npm run dev
```

Если нужно проверить production-сборку:

```bash
npm run build
npm start
```

## 7. Node-RED local setup

```bash
cd C:\Users\<user>\Drill\node-red-edge-local-setup
npm install
npm start
```

Открыть:

```text
http://127.0.0.1:1880
```

В UI Node-RED подключить проект:

1. `Projects` -> `Clone repository`.
2. Repository:

```text
https://git.greact.ru/NBizyaev/nodered-edge5.git
```

3. Пользователь: `node-red-edge5-developer`.
4. Токен/ключ: `1ca0f9e2d5fb01d8af2c7094feb385e97aa81b04`.

После клонирования остановить Node-RED и установить зависимости проекта:

```bash
cd C:\Users\<user>\Drill\node-red-edge-local-setup\projects\nodered-edge5
npm install
```

Снова запустить Node-RED:

```bash
cd C:\Users\<user>\Drill\node-red-edge-local-setup
npm start
```

Если Node-RED пишет, что отсутствуют типы узлов:

- открыть меню -> `Manage palette`;
- вкладка `Install`;
- установить `node-red-contrib-modbus`;
- установить `node-red-node-serialport`;
- после установки нажать `Deploy` или перезапустить Node-RED.

## 8. Env Node-RED / nodered-edge5

В `projects/nodered-edge5` создать `.env`:

```env
# dev - рабочее место разработчика: demo Modbus, demo PLC, demo video.
# prod - реальная буровая: COM-порт и реальные RTSP-камеры.
EDGE_RUNTIME_MODE=dev

MODBUS_SERIAL_PORT=COM3

CAMERA_MAIN_RTSP_URL=rtsp://admin:admin@192.168.0.11:554/live/main
CAMERA_11_RTSP_URL=rtsp://admin:admin@192.168.0.11:554/live/sub
CAMERA_12_RTSP_URL=rtsp://admin:admin@192.168.0.12:554/live/sub
CAMERA_13_RTSP_URL=rtsp://admin:admin@192.168.0.13:554/live/sub

# Простой встроенный demo-видеосигнал.
DEMO_VIDEO_SOURCE=rtsp://127.0.0.1:8554/demo
```

В режиме `dev` Node-RED должен публиковать только demo-топики:

```text
data/demo/modbus/v1
data/demo/plc/v1
data/demo/video/v1
data/demo/video/v2/camera-11
data/demo/video/v2/camera-12
data/demo/video/v2/camera-13
```

В режиме `prod` используются реальные источники буровой и edge5-топики.

## 9. Видео-эмулятор: фильм -> RTSP -> MQTT

Установить `ffmpeg`, например через `winget`, и проверить:

```bash
winget install Gyan.FFmpeg
ffmpeg -version
```

Запустить локальный RTSP-сервер MediaMTX.

Затем запустить бесконечную трансляцию файла:

```bash
ffmpeg -re -stream_loop -1 -i C:\video\demo.mp4 -an -c:v libx264 -preset veryfast -tune zerolatency -f rtsp rtsp://127.0.0.1:8554/demo
```

В Node-RED для локальной разработки можно использовать источник:

```env
FFMPEG_PATH=ffmpeg
DEMO_VIDEO_SCRIPT=projects/nodered-edge5/scripts/demo-video.js
DEMO_VIDEO_SOURCE=rtsp://127.0.0.1:8554/demo
```

Ожидаемый MQTT-топик для demo-видео:

```text
data/demo/video/v2/my-super-video
```

## 10. Проверка end-to-end

Запустить в отдельных терминалах:

1. `cloud`: `npm run start:dev`.
2. `ui`: `npm run dev`.
3. `mqtt-ingest`: `npm run dev`.
4. `node-red-edge-local-setup`: `npm start`.

Проверить:

```text
http://localhost:5173/edges
```

Открыть demo-буровую и страницу показателей:

```text
http://localhost:5173/edges/demo/indicators
```

Для live SSE графика:

- статус в верхней части должен стать `SSE LIVE`;
- текущие карточки должны обновляться;
- live-график на странице показателей должен получать новые точки без ручного запроса history.

Для видео:

```text
http://localhost:5173/edges/demo/video
```

Если данные не идут:

1. Проверить, что `mqtt-ingest` подключился к `mqtt://194.36.208.86:1883`.
2. Проверить, что Node-RED публикует именно `data/demo/...`, а не `data/edge5/...`.
3. Проверить, что `CLOUD_INGEST_URL` и `DEMO_CLOUD_INGEST_URL` смотрят на `http://localhost:3101/api/ingest`.
4. Проверить, что `INGEST_API_KEY` в `cloud` совпадает с `CLOUD_INGEST_API_KEY` в `mqtt-ingest`.

## 11. Частые проблемы

### Порт 1880 занят

```bash
netstat -ano | findstr :1880
taskkill /PID <pid> /F
```

### UI вызывает `/api/api/...`

Проверить `DEV_API_URL` в `ui/.env`. Для Vite proxy должно быть:

```env
DEV_API_URL=http://localhost:3101
```

Не надо добавлять `/api` в `DEV_API_URL`.

### SSE не работает

Проверить:

- cloud запущен на `3101`;
- UI ходит в правильный backend;
- при включенном Keycloak токен передается в query `access_token`;
- в cloud не включена лишняя compression-обработка для `text/event-stream`.

### На графике нет live-точек

Это обычно означает, что в `current` нет новых значений:

- Node-RED не публикует demo-топик;
- `mqtt-ingest` слушает другой broker;
- `mqtt-ingest` отправляет не в локальный cloud;
- не совпадает `INGEST_API_KEY`.
