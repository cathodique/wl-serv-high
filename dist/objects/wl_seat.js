"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSeat = exports.SeatAuthority = void 0;
const base_object_js_1 = require("./base_object.js");
const objectAuthority_js_1 = require("../lib/objectAuthority.js");
const name = 'wl_seat';
// Edit from future me: What the fuck??
// type SeatServerToClient = {
//   'enter': [WlSurface, number, number];
//   'moveTo': [number, number];
//   'leave': [WlSurface];
//   'buttonDown': [number];
//   'buttonUp': [number];
//   'modifier': [WlSurface, number, number, number, ];
//   'focus': [WlSurface, number[]];
//   'blur': [WlSurface];
// };
// type SeatServerToClient = {};
// export type SeatEventServer = EventServer<SeatServerToClient, {}>;
// export type SeatEventClient = EventClient<{}, SeatServerToClient>;
class SeatAuthority extends objectAuthority_js_1.ObjectAuthority {
}
exports.SeatAuthority = SeatAuthority;
class WlSeat extends base_object_js_1.BaseObject {
    info;
    authority;
    // latestSerial: number | null = null;
    pointers = new Set();
    keyboards = new Set();
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.authority = this.registry.seatAuthoritiesByName.get(args.name);
        this.authority.bind(this);
        this.info = this.authority.config;
        this.addCommand('name', { name: this.info.name });
        this.addCommand('capabilities', { capabilities: this.info.capabilities });
    }
    wlGetPointer({ id: pointer }) {
        this.pointers.add(pointer);
    }
    wlGetKeyboard({ id: keyboard }) {
        this.keyboards.add(keyboard);
    }
    addCommandToPointers(eventName, args) {
        for (const pointer of this.pointers) {
            pointer.addCommand(eventName, args);
        }
    }
    addCommandToKeyboards(eventName, args) {
        for (const keyboard of this.keyboards) {
            keyboard.addCommand(eventName, args);
        }
    }
}
exports.WlSeat = WlSeat;
