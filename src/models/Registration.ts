export class Registration {
  id: string;
  eventId: string;
  userId: string;
  timestamp: Date;

  constructor(eventId: string, userId: string) {
    this.id = crypto.randomUUID();
    this.eventId = eventId;
    this.userId = userId;
    this.timestamp = new Date();
  }
}

