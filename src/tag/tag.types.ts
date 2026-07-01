export type TagRow = {
  id: string;
  name: string;
  tag_group: string | null;
  min: number | null;
  max: number | null;
  comment: string;
  unit_of_measurement: string;
  precision: number | null;
};
