export type EdgeRow = {
  id: string;
  name: string;
  parent_id: string | null;
  tag_ids: string[];
  tag_count: number;
  current_tag_count: number;
  live_tag_count: number;
  last_data_at: Date | null;
};
