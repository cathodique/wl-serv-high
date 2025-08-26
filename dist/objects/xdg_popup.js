"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XdgPopup = void 0;
const base_object_js_1 = require("./base_object.js");
const xdg_surface_js_1 = require("./xdg_surface.js");
class XdgPopup extends base_object_js_1.BaseObject {
    appId;
    constructor(conx, args, ifaceName, oid, parent, version) {
        if (!(parent instanceof xdg_surface_js_1.XdgSurface))
            throw new Error('Parent must be xdg_surface');
        super(conx, args, ifaceName, oid, parent, version);
        parent.role = this;
        const config = this.registry.outputRegistry.current;
        // if (!config) throw new Error('Could not fetch outputRegistry - Did you instantiate wl_output before wl_registry?');
        // TODO: Retrieve that automatically (from config or sth idk)
        this.addCommand('configure', { width: 200, height: 200, x: 0, y: 0 });
        parent.addCommand('configure', { serial: parent.newSerial() });
    }
    get renderReady() {
        // Check if the top-level has been set-up enough to be render-ready
        return true;
    }
}
exports.XdgPopup = XdgPopup;
