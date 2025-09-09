"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XdgToplevel = void 0;
const base_object_js_1 = require("./base_object.js");
const xdg_surface_js_1 = require("./xdg_surface.js");
const name = 'xdg_toplevel';
class XdgToplevel extends base_object_js_1.BaseObject {
    appId;
    title;
    assocParent = null;
    constructor(conx, args, ifaceName, oid, parent, version) {
        if (!(parent instanceof xdg_surface_js_1.XdgSurface))
            throw new Error('Parent must be xdg_surface');
        super(conx, args, ifaceName, oid, parent, version);
        parent.role = this;
        // const config = this.registry!.;
        // TODO: Let DE configure which output to use
        const currentOutput = parent.surface.output || this.registry.outputAuthorities.values().next().value.config;
        // TODO: Retrieve that automatically (from config or sth idk)
        this.addCommand('configureBounds', { width: currentOutput.effectiveW, height: currentOutput.effectiveH });
        this.addCommand('wmCapabilities', { capabilities: Buffer.alloc(0) });
        this.addCommand('configure', { width: 0, height: 0, states: Buffer.alloc(0) });
        parent.addCommand('configure', { serial: parent.newSerial() });
    }
    wlSetTitle(args) {
        this.title = args.title;
    }
    wlSetAppId(args) {
        this.appId = args.appId;
    }
    wlSetParent(args) {
        // TODO: Check if is mapped
        this.assocParent = args.parent;
    }
    get renderReady() {
        // Check if the top-level has been set-up enough to be render-ready
        return true;
    }
}
exports.XdgToplevel = XdgToplevel;
