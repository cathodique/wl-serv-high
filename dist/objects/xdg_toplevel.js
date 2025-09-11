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
    lastDimensions = [0, 0];
    constructor(conx, args, ifaceName, oid, parent, version) {
        if (!(parent instanceof xdg_surface_js_1.XdgSurface))
            throw new Error('Parent must be xdg_surface');
        super(conx, args, ifaceName, oid, parent, version);
        parent.role = this;
        parent.surface.setRole("toplevel");
        // const config = this.registry!.;
        this.configureSequence(true, true);
        parent.surface.on("wlCommit", function () {
            const buf = parent.surface.buffer.current;
            if (buf && !(buf.height === this.lastDimensions[0] && buf.width === this.lastDimensions[1])) {
                this.configureSequence(true, false);
                this.lastDimensions = [buf.height, buf.width];
            }
        }.bind(this));
    }
    configureSequence(window, capabilities) {
        // TODO: Let DE configure which output to use
        const maybeDefaultOutput = this.connection.display.outputAuthorities.values().next().value.config;
        const currentOutput = this.parent.surface.output || maybeDefaultOutput;
        // TODO: Retrieve that automatically (from config or sth idk)
        this.addCommand('configureBounds', { width: currentOutput.effectiveW, height: currentOutput.effectiveH });
        this.addCommand('wmCapabilities', { capabilities: Buffer.alloc(0) });
        this.addCommand('configure', { width: this.lastDimensions[1], height: this.lastDimensions[0], states: Buffer.alloc(0) });
        this.parent.addCommand('configure', { serial: this.parent.newSerial() });
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
