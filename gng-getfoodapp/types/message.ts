/**
 * Maps to future Airtable "Harvest Messages" table:
 * - Message (primary, long text)
 * - Harvest (link → Harvests)
 * - Subscriber (link → Subscribers, optional for staff)
 * - Full Name (from Subscriber) (lookup)
 * - Staff posts omit Subscriber link → shown as GNG Team
 * - Created (created time)
 */
export type HarvestMessage = {
  id: string;
  harvestId: string;
  subscriberId: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  body: string;
  isStaff: boolean;
  createdAt: string;
};
