"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSeat = exports.SeatRegistry = void 0;
const base_object_js_1 = require("./base_object.js");
const specific_registry_1 = require("../lib/specific_registry");
const name = 'wl_seat';
class SeatRegistry extends specific_registry_1.SpecificRegistry {
    get iface() { return name; }
}
exports.SeatRegistry = SeatRegistry;
class WlSeat extends base_object_js_1.BaseObject {
    info;
    seatRegistry;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.seatRegistry = this.registry.seatRegistry;
        this.info = this.seatRegistry.map.get(args.name);
        this.addCommand('name', { name: this.info.name });
        this.addCommand('capabilities', { capabilities: this.info.capabilities });
    }
}
exports.WlSeat = WlSeat;
