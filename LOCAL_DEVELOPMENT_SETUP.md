# Локальный контур edge + cloud + UI

Инструкция как поднять локально `Node-RED edge`, `mqtt-ingest`, `cloud` и `ui`, увидеть live-данные и проверить основные кейсы разработки.

## Что получится

- Node-RED публикует demo-данные в MQTT broker `mqtt://localhost:1883`.
- Локальный `drill-mqtt-ingest` читает demo-топики и отправляет данные в локальный `drill-cloud-backend`.
- Локальный `drill-cloud-backend` пишет в БД `drill-cloud-database` и отдает API на `http://localhost:3101`.
- Локальный `drill-cloud-frontend` работает на `http://localhost:5173`.

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

```cmd
cd C:\Users\<user>\Drill-Cloud

git clone https://github.com/Drill-Cloud/drill-cloud-backend
git clone https://github.com/Drill-Cloud/drill-cloud-frontend
git clone https://github.com/Drill-Cloud/drill-mqtt-ingest
git clone https://github.com/Drill-Cloud/drill-edge-nodered-setup
```

Проект `nodered-edge5` удобнее подключать через UI Node-RED, потому что он живет как Node-RED project.

## 3. База данных

### Быстрый вариант

Для обычной разработки используем готовую dev-БД:

```env
DATABASE_URL=postgres://имя:пароль@сервер:порт/база
```

Это самый быстрый путь для проверки UI, live SSE графика, mqtt-ingest и Node-RED эмуляторов.

## 4. Cloud

```cmd
cd C:\Users\<user>\Drill-Cloud\drill-cloud-backend
npm install
```

Создать `.env`:
```bash
cp .env.example .env
```

Запуск:

```bash
npm run start:dev
```

Проверка:

```bash
curl http://localhost:3101/api/health
```

Защищённые API-маршруты без access token возвращают `401`. UI получает токен через Keycloak и автоматически добавляет его к запросам.

## 5. UI

```cmd
cd C:\Users\<user>\Drill-Cloud\drill-cloud-frontend
npm install
```

Создать `.env`:
```bash
cp .env.example .env
```

Запуск:
```bash
npm run dev
```

Открыть:

```text
http://localhost:5173
```

После открытия UI перенаправит браузер на `https://sso.drillcloud.ru`, а после входа вернёт на локальный адрес. серверный клиент Keycloak настроен для `http://localhost:5173/*`.

## 6. mqtt-ingest

`mqtt-ingest` связывает MQTT broker и локальный `cloud`.

```cmd
cd C:\Users\<user>\Drill-Cloud\drill-mqtt-ingest\app
npm install
```

По умолчанию для общего demo-контура используется удаленный broker:

```env
DEV_MQTT_BROKER=drillcloud.ru
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

```cmd
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
https://github.com/Drill-Cloud/drill-edge-nodered-edge5
```

3. Пользователь: `node-red-edge5-developer`.
4. Токен/ключ: <попросить у товарищей>.

## 8. Env Node-RED / nodered-edge5

`.env`:

```env
EDGE_RUNTIME_MODE=dev
#DEV_MQTT_BROKER=localhost
DEV_MQTT_BROKER=drillcloud.ru
DEV_CAMERA_URL1=rtsp://127.0.0.1:8554/video1
DEV_CAMERA_URL2=rtsp://127.0.0.1:8554/video2
DEV_CAMERA_URL3=
```

## 9. Видео-эмулятор: фильм -> RTSP -> MQTT

Установить `ffmpeg`, например через `winget`, и проверить:

```cmd
winget install Gyan.FFmpeg
ffmpeg -version
```

Запустить локальный RTSP-сервер MediaMTX.

Затем запустить бесконечную трансляцию файла:

```cmd
C:\Users\Пользователь\Videos\Потоки>mediamtx
ffmpeg -re -stream_loop -1 -i "C:\Users\Пользователь\Videos\Потоки\21526-318987562_medium.mp4" -c copy -f rtsp rtsp://127.0.0.1:8554/video1
ffmpeg -re -stream_loop -1 -i "C:\Users\Пользователь\Videos\Потоки\316737_medium.mp4" -c copy -f rtsp rtsp://127.0.0.1:8554/video2
```
