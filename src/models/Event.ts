export class Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  place: string;
  category: 'conférence' | 'sport' | 'atelier' | 'autre';
  capacity: number;
  creatorEmail: string;

  constructor(
    title: string,
    description: string,
    date: Date,
    place: string,
    category: 'conférence' | 'sport' | 'atelier' | 'autre',
    capacity: number,
    creatorEmail: string = 'admin@pythagoras.local'
  ) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.date = date;
    this.place = place;
    this.category = category;
    this.capacity = capacity;
    this.creatorEmail = (creatorEmail || 'admin@pythagoras.local').toLowerCase().trim();
  }

  isPassed(): boolean {
    return this.date.getTime() < Date.now();
  }
}

