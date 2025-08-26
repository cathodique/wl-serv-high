"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlDataOffer = void 0;
const base_object_js_1 = require("./base_object.js");
const fromServerSymbol_js_1 = require("../misc/fromServerSymbol.js");
const name = 'wl_data_offer';
class WlDataOffer extends base_object_js_1.BaseObject {
    constructor(conx, args, ifaceName, oid, parent, version) {
        if (!args[fromServerSymbol_js_1.fromServer])
            throw new Error("Data offer may only be instantiated by the server");
        super(conx, args, ifaceName, oid, parent, version);
        this.addCommand('offer', { mimeType: args.mimeType });
    }
}
exports.WlDataOffer = WlDataOffer;
