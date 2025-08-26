"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signalbound = void 0;
const event_clientserver_1 = require("./event_clientserver");
class Signalbound {
    get iface() { throw new Error("Signalbound (base class for specific signalbound values) does not have an iface name"); }
    ;
    v;
    transport;
    constructor(v) {
        this.v = v;
        this.transport = new event_clientserver_1.EventServer();
    }
}
exports.Signalbound = Signalbound;
