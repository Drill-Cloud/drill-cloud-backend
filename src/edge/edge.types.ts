export type EdgeRow = {
  id: string;
  name: string;
  parent_id: string | null;
  tag_ids: string[];
  tag_count: number;
};
