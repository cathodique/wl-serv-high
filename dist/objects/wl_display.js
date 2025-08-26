"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlDisplay = void 0;
const base_object_js_1 = require("./base_object.js");
const name = 'wl_display';
class WlDisplay extends base_object_js_1.BaseObject {
    _version = 1;
    wlSync(args) {
        args.callback.done(1);
        // console.log('AAAA')
        this.connection.sendPending();
    }
    // wlGetRegistry(args: { registry: WlRegistry }) {
    //   this.connection.registry = args.registry;
    // }
    wlDestroy() { }
}
exports.WlDisplay = WlDisplay;
