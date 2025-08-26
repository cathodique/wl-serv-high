"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XdgWmBase = void 0;
const base_object_js_1 = require("./base_object.js");
class XdgWmBase extends base_object_js_1.BaseObject {
    wlSurface;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.wlSurface = args.surface;
    }
    wlGetXdgSurface(args) {
        args.surface.xdgSurface = args.id;
    }
}
exports.XdgWmBase = XdgWmBase;
