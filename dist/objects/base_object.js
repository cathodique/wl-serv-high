"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseObject = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
class BaseObject extends wl_serv_low_1.ObjectReference {
    connection;
    constructor(conx, args, ifaceName, newOid, parent, version) {
        super(ifaceName, newOid, parent, version);
        this.connection = conx;
    }
    wlDestroy() {
        this.connection.destroy(this.oid);
    }
    toString() {
        return `[wlObject ${this.iface}]`;
    }
    addCommand(eventName, args) {
        this.connection.addCommand(this, eventName, args);
    }
    get registry() {
        if (this.parent === this)
            return undefined;
        return this.parent.registry;
    }
}
exports.BaseObject = BaseObject;
