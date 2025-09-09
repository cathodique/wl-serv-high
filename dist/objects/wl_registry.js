"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlRegistry = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const base_object_js_1 = require("./base_object.js");
const wl_output_js_1 = require("./wl_output.js");
const wl_seat_js_1 = require("./wl_seat.js");
// TODO: REFACTOR (WTF!!)
// TODO contents:
// These are supposed to be *global* objects
// These are not supposed to be "one per connection"
// Also removes the need for ../lib/specificregistry.ts
class WlRegistry extends base_object_js_1.BaseObject {
    get registry() { return this; }
    static baseRegistry = [
        null,
        'wl_compositor',
        'wl_shm',
        'wl_subcompositor',
        'xdg_wm_base',
        'wl_data_device_manager',
    ];
    static supportedByRegistry = [
        ...WlRegistry.baseRegistry,
        'wl_seat',
        'wl_output',
    ];
    contents = [...WlRegistry.baseRegistry];
    outputAuthorities = new Map();
    outputAuthoritiesByConfig = new Map();
    seatAuthorities = new Map();
    seatAuthoritiesByConfig = new Map();
    constructor(conx, args, ifaceName, oid, parent, version) {
        // if (conx.registry) return conx.registry;
        super(conx, args, ifaceName, oid, parent, version);
        const regMeta = this.connection.hlCompositor.metadata.wl_registry;
        for (const output of regMeta.outputs) {
            const nextIdx = this.contents.length;
            this.contents[nextIdx] = 'wl_output';
            const outputAuth = new wl_output_js_1.OutputAuthority(output, nextIdx);
            this.outputAuthorities.set(nextIdx, outputAuth);
            this.outputAuthoritiesByConfig.set(output, outputAuth);
        }
        for (const seat of regMeta.seats) {
            const nextIdx = this.contents.length;
            this.contents[nextIdx] = 'wl_seat';
            const seatAuth = new wl_seat_js_1.SeatAuthority(seat, nextIdx);
            this.seatAuthorities.set(nextIdx, seatAuth);
            this.seatAuthoritiesByConfig.set(seat, seatAuth);
        }
        for (const numericName in this.contents) {
            const name = this.contents[numericName];
            if (!name)
                continue;
            const iface = wl_serv_low_1.interfaces[name];
            conx.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
        }
    }
    // wlDestroy(): void {
    //   const regMeta = this.connection.hlCompositor.metadata.wl_registry;
    //   regMeta.outputs.unapplyTo(this);
    //   regMeta.seats.unapplyTo(this);
    // }
    wlBind({ id }) { }
}
exports.WlRegistry = WlRegistry;
