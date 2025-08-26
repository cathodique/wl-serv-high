"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlPointer = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const base_object_js_1 = require("./base_object.js");
const wl_seat_js_1 = require("./wl_seat.js");
class WlPointer extends base_object_js_1.BaseObject {
    recipient;
    latestSerial = null;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        if (!(parent instanceof wl_seat_js_1.WlSeat))
            throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');
        const seatRegistry = parent.seatRegistry;
        this.recipient = seatRegistry.transports.get(conx).get(parent.info).createRecipient();
        this.recipient.on('enter', (function (enteringSurface, surfX, surfY) {
            this.addCommand('enter', {
                serial: this.latestSerial = this.connection.time.getTime(),
                surface: enteringSurface,
                surfaceX: surfX,
                surfaceY: surfY,
            });
            this.addCommand('frame', {});
            this.addCommand('motion', {
                time: this.connection.time.getTime(),
                surfaceX: surfX,
                surfaceY: surfY,
            });
            this.addCommand('frame', {});
            this.connection.sendPending();
        }).bind(this));
        this.recipient.on('moveTo', (function (surfX, surfY) {
            this.addCommand('motion', {
                time: this.connection.time.getTime(),
                surfaceX: surfX,
                surfaceY: surfY,
            });
            this.addCommand('frame', {});
            this.connection.sendPending();
        }).bind(this));
        this.recipient.on('leave', (function (leavingSurface) {
            this.addCommand('leave', {
                serial: this.latestSerial = this.connection.time.getTime(),
                surface: leavingSurface,
            });
            this.addCommand('frame', {});
            this.connection.sendPending();
        }).bind(this));
        this.recipient.on('buttonDown', (function (button) {
            this.addCommand('button', {
                serial: this.latestSerial = this.connection.time.getTime(),
                time: this.connection.time.getTime(),
                button: button,
                state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.pressed,
            });
            this.addCommand('frame', {});
            this.connection.sendPending();
        }).bind(this));
        this.recipient.on('buttonUp', (function (button) {
            this.addCommand('button', {
                serial: this.latestSerial = this.connection.time.getTime(),
                time: this.connection.time.getTime(),
                button: button,
                state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.released,
            });
            this.addCommand('frame', {});
            this.connection.sendPending();
        }).bind(this));
    }
}
exports.WlPointer = WlPointer;
