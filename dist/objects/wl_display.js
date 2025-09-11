"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlDisplay = void 0;
const base_object_js_1 = require("./base_object.js");
const wl_output_js_1 = require("./wl_output.js");
const wl_seat_js_1 = require("./wl_seat.js");
class WlDisplay extends base_object_js_1.BaseObject {
    _version = 1;
    outputAuthorities = new Map();
    seatAuthorities = new Map();
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        const regMeta = this.connection.hlCompositor.metadata.wl_registry;
        for (const output of regMeta.outputs) {
            const outputAuth = new wl_output_js_1.OutputAuthority(output);
            this.outputAuthorities.set(output, outputAuth);
        }
        for (const seat of regMeta.seats) {
            const seatAuth = new wl_seat_js_1.SeatAuthority(seat);
            this.seatAuthorities.set(seat, seatAuth);
        }
    }
    wlSync(args) {
        args.callback.done(1);
        // console.log('AAAA')
        this.connection.sendPending();
    }
    // wlGetRegistry(args: { registry: WlRegistry }) {
    //   this.connection.registry = args.registry;
    // }
    wlDestroy() { }
}
exports.WlDisplay = WlDisplay;
