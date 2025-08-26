"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlRegistry = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const base_object_js_1 = require("./base_object.js");
class WlRegistry extends base_object_js_1.BaseObject {
    get registry() { return this; }
    static baseRegistry = [
        null,
        'wl_compositor',
        'wl_shm',
        'wl_subcompositor',
        'xdg_wm_base',
        'wl_data_device_manager',
    ];
    static supportedByRegistry = [
        ...WlRegistry.baseRegistry,
        'wl_seat',
        'wl_output',
    ];
    contents = [...WlRegistry.baseRegistry];
    outputRegistry;
    seatRegistry;
    constructor(conx, args, ifaceName, oid, parent, version) {
        // if (conx.registry) return conx.registry;
        super(conx, args, ifaceName, oid, parent, version);
        const regMeta = this.connection.hlCompositor.metadata.wl_registry;
        regMeta.outputs.applyTo(this);
        this.outputRegistry = regMeta.outputs;
        regMeta.seats.applyTo(this);
        this.seatRegistry = regMeta.seats;
        for (const numericName in this.contents) {
            const name = this.contents[numericName];
            if (!name)
                continue;
            const iface = wl_serv_low_1.interfaces[name];
            conx.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
        }
    }
    wlBind() { }
    wlGetRegistry() { }
}
exports.WlRegistry = WlRegistry;
