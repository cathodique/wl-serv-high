"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlPointer = void 0;
const base_object_js_1 = require("./base_object.js");
const wl_seat_js_1 = require("./wl_seat.js");
class WlPointer extends base_object_js_1.BaseObject {
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        if (!(parent instanceof wl_seat_js_1.WlSeat))
            throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');
    }
    wlSetCursor({ surface }) {
        surface.setRole("cursor");
    }
}
exports.WlPointer = WlPointer;
