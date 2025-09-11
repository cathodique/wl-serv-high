"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlDataDevice = void 0;
const base_object_js_1 = require("./base_object.js");
const fromServerSymbol_js_1 = require("../misc/fromServerSymbol.js");
class WlDataDevice extends base_object_js_1.BaseObject {
    seat;
    // recipient: SeatEventClient;
    onDestroy = [];
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.seat = args.seat;
        // this.recipient = this.seat.seatRegistry.transports.get(conx)!.get(this.seat.info)!.createRecipient();
        this.connection.instances.get('wl_surface')?.forEach(function (v) {
            const surf = v;
            const cb = this.surfaceFocusCallback.bind(this);
            surf.on('shown', cb);
            this.onDestroy.push(() => {
                surf.off('shown', cb);
            });
        }.bind(this));
    }
    surfaceFocusCallback(kbd) {
        const newOid = this.connection.createServerOid();
        this.addCommand('dataOffer', { id: { oid: newOid } });
        const newKidOid = this.connection.createObjRef({ mimeType: 'text/plain;charset=utf-8', [fromServerSymbol_js_1.fromServer]: true }, 'wl_data_offer', newOid, this);
        this.connection.createObject(newKidOid);
        this.addCommand('selection', { id: newKidOid });
    }
}
exports.WlDataDevice = WlDataDevice;
