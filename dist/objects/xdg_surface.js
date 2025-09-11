"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XdgSurface = void 0;
const doublebuffer_js_1 = require("../lib/doublebuffer.js");
const base_object_js_1 = require("./base_object.js");
class XdgSurface extends base_object_js_1.BaseObject {
    surface;
    role = null;
    lastConfigureSerial = 0;
    wasLastConfigureAcked = true;
    geometry = new doublebuffer_js_1.DoubleBuffer({ x: null, y: null, width: null, height: null });
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.surface = args.surface;
        this.surface.doubleBufferedState.add(this.geometry);
    }
    wlDestroy() {
        super.wlDestroy();
        this.surface.doubleBufferedState.delete(this.geometry);
    }
    newSerial() {
        this.lastConfigureSerial += 1;
        this.wasLastConfigureAcked = false;
        return this.lastConfigureSerial;
    }
    wlAckConfigure({ serial }) {
        if (serial !== this.lastConfigureSerial)
            throw new Error('Serials do not match');
        if (this.wasLastConfigureAcked)
            throw new Error('Last configure was already acked');
        this.wasLastConfigureAcked = true;
    }
    wlSetWindowGeometry(newGeom) {
        this.geometry.pending = newGeom;
    }
}
exports.XdgSurface = XdgSurface;
