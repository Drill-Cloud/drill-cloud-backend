ALTER TABLE camera
  ADD COLUMN IF NOT EXISTS name varchar;

WITH numbered_cameras AS (
  SELECT
    edge,
    protocol,
    source,
    row_number() OVER (PARTITION BY edge ORDER BY source, protocol) AS position
  FROM camera
)
UPDATE camera
SET name = 'Камера ' || numbered_cameras.position
FROM numbered_cameras
WHERE
  camera.edge = numbered_cameras.edge
  AND camera.protocol = numbered_cameras.protocol
  AND camera.source = numbered_cameras.source
  AND (camera.name IS NULL OR btrim(camera.name) = '');

ALTER TABLE camera
  ALTER COLUMN name SET NOT NULL;
