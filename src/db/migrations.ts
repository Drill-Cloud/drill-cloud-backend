export type DbMigration = {
  id: string;
  fileName: string;
};

export const DB_MIGRATIONS: DbMigration[] = [
  {
    id: '0000_cloud_beta_schema',
    fileName: '0000_cloud_beta_schema.sql',
  },
  {
    id: '0001_camera',
    fileName: '0001_camera.sql',
  },
  {
    id: '0002_current_value_nullable',
    fileName: '0002_current_value_nullable.sql',
  },
  {
    id: '0003_camera_name',
    fileName: '0003_camera_name.sql',
  },
  {
    id: '0004_user_ui_settings',
    fileName: '0004_user_ui_settings.sql',
  },
];
