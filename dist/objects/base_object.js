"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseObject = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
class ImplementationError extends Error {
}
class BaseObject extends wl_serv_low_1.ObjectReference {
    process() { }
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
    raiseError(errorName, description) {
        const errorEnum = wl_serv_low_1.interfaces[this.iface].enums.error;
        if (!(errorName in errorEnum.atoi))
            throw new ImplementationError("Error does not exist in this object");
        return this.connection.display.addCommand("error", {
            objectId: this.oid,
            code: errorEnum.atoi[errorName],
            description: description || "N/A",
        });
    }
    toJSON() {
        return `${this.iface}#${this.oid}`;
    }
}
exports.BaseObject = BaseObject;
