"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlOutput = exports.OutputRegistry = void 0;
const base_object_js_1 = require("./base_object.js");
const specific_registry_js_1 = require("../lib/specific_registry.js");
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const name = 'wl_output';
class OutputRegistry extends specific_registry_js_1.SpecificRegistry {
    get iface() { return name; }
    current;
    constructor(v, current = v[0]) {
        super(v);
        this.current = current;
    }
}
exports.OutputRegistry = OutputRegistry;
class WlOutput extends base_object_js_1.BaseObject {
    info;
    recipient;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        const outputReg = this.registry.outputRegistry;
        this.info = outputReg.map.get(args.name);
        this.recipient = outputReg.transports.get(conx).get(this.info).createRecipient();
        this.advertise();
        this.recipient.on('update', this.advertise.bind(this));
        this.recipient.on('enter', function (surf) {
            surf.addCommand('enter', { output: this });
            this.connection.sendPending();
        }.bind(this));
    }
    advertise() {
        // TODO: FIX THIS MESS
        this.addCommand('geometry', {
            x: this.info.x,
            y: this.info.y,
            physicalWidth: this.info.w / 3.8,
            physicalHeight: this.info.h / 3.8,
            subpixel: wl_serv_low_1.interfaces.wl_output.enums.subpixel.atoi.horizontal_rgb,
            make: 'IDK',
            model: 'IDK As if I knew',
            transform: wl_serv_low_1.interfaces.wl_output.enums.transform.atoi.normal,
        });
        this.addCommand('mode', {
            flags: 3, // idc i just wann move on
            width: this.info.w,
            height: this.info.h,
            refresh: 60, // again idrc for now
        });
        this.addCommand('scale', { factor: 1 });
        this.addCommand('done', {});
    }
    release() { this.recipient.destroy(); }
}
exports.WlOutput = WlOutput;
