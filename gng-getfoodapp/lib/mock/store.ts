import type { Harvest } from "@/types/harvest";
import type { HarvestMessage } from "@/types/message";
import type { HarvestRsvp } from "@/types/rsvp";
import type { Subscriber } from "@/types/subscriber";
import {
  MOCK_HARVESTS,
  MOCK_MESSAGES,
  MOCK_RSVPS,
  MOCK_SUBSCRIBERS,
} from "@/lib/mock/seed";

type MockStore = {
  subscribers: Subscriber[];
  harvests: Harvest[];
  rsvps: HarvestRsvp[];
  messages: HarvestMessage[];
};

const globalForMock = globalThis as unknown as { __gngMockStore?: MockStore };

function createStore(): MockStore {
  return {
    subscribers: structuredClone(MOCK_SUBSCRIBERS),
    harvests: structuredClone(MOCK_HARVESTS),
    rsvps: structuredClone(MOCK_RSVPS),
    messages: structuredClone(MOCK_MESSAGES),
  };
}

export function getMockStore(): MockStore {
  if (!globalForMock.__gngMockStore) {
    globalForMock.__gngMockStore = createStore();
  }
  return globalForMock.__gngMockStore;
}

export function resetMockStore() {
  globalForMock.__gngMockStore = createStore();
}
