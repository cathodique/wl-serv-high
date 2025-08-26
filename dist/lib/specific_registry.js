"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificRegistry = void 0;
const events_1 = require("events");
const event_clientserver_1 = require("./event_clientserver");
class SpecificRegistry extends events_1.EventEmitter {
    map = new Map();
    get iface() { throw new Error("SpecificRegistry (base class for specific registries) does not have an iface name"); }
    ;
    vs;
    transports = new Map();
    constructor(vs) {
        super();
        this.vs = new Set(vs);
    }
    addConnection(c) {
        const map = new Map();
        for (const v of this.vs)
            map.set(v, new event_clientserver_1.EventServer());
        this.transports.set(c, map);
    }
    removeConnection(c) {
        this.transports.delete(c);
    }
    add(v) { this.vs.add(v); this.emit('new', v); }
    delete(v) { this.vs.delete(v); this.emit('del', v); }
    addTo(r, v) {
        this.map.set(r.contents.length, v);
        r.contents.push(this.iface);
    }
    unmount = new Map();
    applyTo(reg) {
        for (const v of this.vs)
            this.addTo(reg, v);
        const newEvList = (function (v) {
            this.addTo(reg, v);
        }).bind(this);
        this.on('new', newEvList);
        const delEvList = (function (v) {
            this.addTo(reg, v);
        }).bind(this);
        this.on('del', delEvList);
        this.unmount.set(reg, new Map([['new', newEvList], ['del', delEvList]]));
    }
    unapplyTo(reg) {
        this.unmount.get(reg).forEach((v, k) => this.off(k, v));
    }
}
exports.SpecificRegistry = SpecificRegistry;
