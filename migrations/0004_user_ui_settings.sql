CREATE TABLE IF NOT EXISTS public.user_ui_settings (
  user_subject varchar(255) PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamp(3) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

