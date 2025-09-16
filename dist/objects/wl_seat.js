"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSeat = exports.SeatAuthority = void 0;
// import { EventClient, EventServer } from "../lib/event_clientserver.js";
const base_object_js_1 = require("./base_object.js");
const objectAuthority_js_1 = require("../lib/objectAuthority.js");
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
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
    modifiers(dep, latch, lock, group, serial) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToKeyboards('modifiers', {
                serial: serial || this.connection.serial.next(),
                modsDepressed: dep,
                modsLatched: latch,
                modsLocked: lock,
                group: group,
            });
        }.bind(this));
        this.connection.sendPending();
    }
    focus(surf, keysDown) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToKeyboards('enter', {
                serial: this.connection.time.getTime(),
                surface: surf,
                keys: Buffer.from(keysDown),
            });
        }.bind(this));
        this.connection.sendPending();
    }
    blur(surf) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToKeyboards('leave', {
                serial: this.connection.time.getTime(),
                surface: surf,
            });
        }.bind(this));
        this.connection.sendPending();
    }
    keyDown(keyDown, isRepeat) {
        const keyStateEnum = wl_serv_low_1.interfaces.wl_keyboard.enums.keyState.atoi;
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToKeyboards('key', {
                serial: this.connection.serial.next(),
                time: this.connection.time.getTime(),
                key: keyDown - 8,
                state: isRepeat ? keyStateEnum.repeated : keyStateEnum.pressed,
            });
        }.bind(this));
        this.connection.sendPending();
    }
    keyUp(keyUp) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToKeyboards('key', {
                serial: this.connection.serial.next(),
                time: this.connection.time.getTime(),
                key: keyUp - 8,
                state: wl_serv_low_1.interfaces.wl_keyboard.enums.keymapFormat.atoi.released,
            });
        }.bind(this));
        this.connection.sendPending();
    }
    enter(surf, surfX, surfY) {
        const enterSerial = this.connection.serial.next();
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToPointers('enter', {
                serial: enterSerial,
                surface: surf,
                surfaceX: surfX,
                surfaceY: surfY,
            });
            wlSeat.addCommandToPointers('frame', {});
            wlSeat.addCommandToPointers('motion', {
                time: this.connection.time.getTime(),
                surfaceX: surfX,
                surfaceY: surfY,
            });
            wlSeat.addCommandToPointers('frame', {});
        }.bind(this));
        this.connection.sendPending();
        return enterSerial;
    }
    moveTo(surfX, surfY) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToPointers('motion', {
                time: this.connection.time.getTime(),
                surfaceX: surfX,
                surfaceY: surfY,
            });
            wlSeat.addCommandToPointers('frame', {});
        }.bind(this));
        this.connection.sendPending();
    }
    leave(surf) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToPointers('leave', {
                serial: this.connection.serial.next(),
                surface: surf,
            });
            wlSeat.addCommandToPointers('frame', {});
        }.bind(this));
        this.connection.sendPending();
    }
    buttonDown(button) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToPointers('button', {
                serial: this.connection.serial.next(),
                time: this.connection.time.getTime(),
                button: button,
                state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.pressed,
            });
            wlSeat.addCommandToPointers('frame', {});
        }.bind(this));
        this.connection.sendPending();
    }
    buttonUp(button) {
        this.forAll(function (wlSeat) {
            wlSeat.addCommandToPointers('button', {
                serial: this.connection.serial.next(),
                time: this.connection.time.getTime(),
                button: button,
                state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.released,
            });
            wlSeat.addCommandToPointers('frame', {});
        }.bind(this));
        this.connection.sendPending();
    }
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
