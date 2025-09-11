"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlOutput = exports.OutputAuthority = void 0;
const base_object_js_1 = require("./base_object.js");
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const objectAuthority_js_1 = require("../lib/objectAuthority.js");
const name = 'wl_output';
// type OutputServerToClient = { 'update': [], 'enter': [WlSurface] };
// export type OutputEventServer = EventServer<OutputServerToClient, {}>;
// export type OutputEventClient = EventClient<{}, OutputServerToClient>;
// export class OutputRegistry {
//   get iface() { return name }
//   current: OutputConfiguration;
//   constructor(v: OutputConfiguration[], current: OutputConfiguration = v[0]){
//     this.current = current;
//   }
// }
class OutputAuthority extends objectAuthority_js_1.ObjectAuthority {
}
exports.OutputAuthority = OutputAuthority;
class WlOutput extends base_object_js_1.BaseObject {
    info;
    authority;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.authority = this.registry.outputAuthoritiesByName.get(args.name);
        this.authority.bind(this);
        this.info = this.authority.config;
        this.advertise();
        // this.recipient.on('update', this.advertise.bind(this));
        // this.recipient.on('enter', function (this: WlOutput, surf: WlSurface) {
        // }.bind(this));
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
            refresh: 60000, // again idrc for now
        });
        this.addCommand('scale', { factor: 1 });
        this.addCommand('done', {});
    }
}
exports.WlOutput = WlOutput;
