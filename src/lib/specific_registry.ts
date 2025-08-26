import { EventEmitter } from "events";
import { EventServer } from "./event_clientserver";
import { WlRegistry } from "../objects/wl_registry.js";
import type { Connection } from "@cathodique/wl-serv-low";
import { HLConnection } from "..";

export class SpecificRegistry<T, U extends EventServer<Record<string, any[]>, Record<string, any[]>>> extends EventEmitter<{ 'new': [T]; 'del': [T]; }> {
  map: Map<number, T> = new Map();

  get iface(): string { throw new Error("SpecificRegistry (base class for specific registries) does not have an iface name"); };

  vs: Set<T>;

  transports: Map<HLConnection, Map<T, U>> = new Map();

  constructor(vs: T[]) {
    super();
    this.vs = new Set(vs);
  }
  addConnection(c: HLConnection) {
    const map = new Map();
    for (const v of this.vs) map.set(v, new EventServer() as U);
    this.transports.set(c, map);
  }
  removeConnection(c: HLConnection) {
    this.transports.delete(c);
  }
  add(v: T) { this.vs.add(v); this.emit('new', v); }
  delete(v: T) { this.vs.delete(v); this.emit('del', v); }

  addTo(r: WlRegistry, v: T) {
    this.map.set(r.contents.length, v);
    r.contents.push(this.iface);
  }

  unmount = new Map<WlRegistry, Map<'new' | 'del', (v: T) => void>>();
  applyTo(reg: WlRegistry) {
    for (const v of this.vs) this.addTo(reg, v);

    const newEvList = (function (this: SpecificRegistry<T, U>, v: T) {
      this.addTo(reg, v);
    }).bind(this);
    this.on('new', newEvList);

    const delEvList = (function (this: SpecificRegistry<T, U>, v: T) {
      this.addTo(reg, v);
    }).bind(this);
    this.on('del', delEvList);

    this.unmount.set(reg, new Map([['new', newEvList], ['del', delEvList]]));
  }
  unapplyTo(reg: WlRegistry) {
    this.unmount.get(reg)!.forEach((v, k) => this.off(k, v));
  }
}
