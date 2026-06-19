export type TagRow = {
  id: string;
  name: string;
  tag_group: string | null;
  min: number;
  max: number;
  comment: string;
  unit_of_measurement: string;
  edge_ids: string[];
  precision: number | null;
};
