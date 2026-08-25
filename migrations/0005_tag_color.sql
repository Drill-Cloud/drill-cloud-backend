ALTER TABLE public.tag
  ADD COLUMN IF NOT EXISTS color varchar(7);

-- Цвета назначаются существующим тегам один раз и затем хранятся в БД.
WITH palette(position, color) AS (
  VALUES
    (1, '#649DFF'),
    (2, '#6EE7B7'),
    (3, '#FACC15'),
    (4, '#FB7185'),
    (5, '#67E8F9'),
    (6, '#F97316'),
    (7, '#A78BFA'),
    (8, '#84CC16'),
    (9, '#F472B6'),
    (10, '#22D3EE'),
    (11, '#FBBF24'),
    (12, '#818CF8')
),
ordered_tags AS (
  SELECT
    id,
    row_number() OVER (ORDER BY id) AS position
  FROM public.tag
  WHERE color IS NULL
)
UPDATE public.tag AS tag
SET color = palette.color
FROM ordered_tags
JOIN palette
  ON palette.position = ((ordered_tags.position - 1) % 12) + 1
WHERE tag.id = ordered_tags.id;

ALTER TABLE public.tag
  ALTER COLUMN color SET NOT NULL;

ALTER TABLE public.tag
  ADD CONSTRAINT tag_color_format_check
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
