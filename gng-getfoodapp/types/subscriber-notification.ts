export type SubscriberNotification =
  | {
      id: string;
      type: "message";
      title: string;
      body: string;
      sentAt: string;
      harvestId: string;
      harvestName: string;
      messageId: string;
      href: string;
    }
  | {
      id: string;
      type: "harvest_live";
      title: string;
      body: string;
      sentAt: string;
      harvestId: string;
      harvestName: string;
      href: string;
    };
