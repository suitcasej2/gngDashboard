export type DraftHarvestRow = {
  id: string;
  name: string;
  startDate: string | null;
  startTime: string | null;
  lastModified: string | null;
  status: string | null;
  urgentUpdate: string | null;
  sendUpdateNow: boolean | null;
};
