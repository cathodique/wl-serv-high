export class Time {
  origin: number;

  constructor() { this.origin = Date.now() }
  getTime() { return Date.now() - this.origin; }
}
