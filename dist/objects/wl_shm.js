"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlShm = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const base_object_js_1 = require("./base_object.js");
class WlShm extends base_object_js_1.BaseObject {
    static supportedFormats = [
        'argb8888',
        'xrgb8888',
    ];
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        for (const format of WlShm.supportedFormats)
            this.addCommand('format', { format: wl_serv_low_1.interfaces['wl_shm'].enums.format.atoi[format] });
    }
    wlCreatePool() { }
}
exports.WlShm = WlShm;
