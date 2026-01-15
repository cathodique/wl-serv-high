import { EventServer } from "./event_clientserver.js";

export class Signalbound<T, U extends EventServer<Record<string, any[]>, Record<string, any[]>>> {
  get iface(): string { throw new Error("Signalbound (base class for specific signalbound values) does not have an iface name"); };
  v: T;

  transport: U;

  constructor(v: T) {
    this.v = v;
    this.transport = new EventServer() as U;
  }
}
