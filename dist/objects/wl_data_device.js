"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlDataDevice = void 0;
const base_object_js_1 = require("./base_object.js");
const fromServerSymbol_js_1 = require("../misc/fromServerSymbol.js");
class WlDataDevice extends base_object_js_1.BaseObject {
    seat;
    recipient;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.seat = args.seat;
        this.recipient = this.seat.seatRegistry.transports.get(conx).get(this.seat.info).createRecipient();
        this.recipient.on('focus', function () {
            const newOid = this.connection.createServerOid();
            this.addCommand('dataOffer', { id: { oid: newOid } });
            const newKidOid = conx.createObjRef({ mimeType: 'text/plain;charset=utf-8', [fromServerSymbol_js_1.fromServer]: true }, 'wl_data_offer', newOid, this);
            conx.createObject(newKidOid);
            this.addCommand('selection', { id: null });
        }.bind(this));
    }
}
exports.WlDataDevice = WlDataDevice;
