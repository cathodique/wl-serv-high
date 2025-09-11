"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HLConnection = exports.HLCompositor = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const new_id_map_1 = require("./new_id_map");
const time_1 = require("./lib/time");
const tickAuthority_1 = require("./lib/tickAuthority");
const serialAuthority_1 = require("./lib/serialAuthority");
const promises_1 = require("node:fs/promises");
const getStackTrace = function () {
    const obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};
class HLCompositor extends wl_serv_low_1.Compositor {
    metadata;
    ticks = new tickAuthority_1.TickAuthority();
    constructor(metadata) {
        super({
            socketPath: '',
            createConnection(connId, socket) {
                return new HLConnection(connId, this, socket, {
                    createObjRef(args, ifaceName, newOid, parent, version) {
                        const isIn = (ifaceName) => Object.hasOwn(new_id_map_1.newIdMap, ifaceName);
                        if (!isIn(ifaceName)) {
                            // console.log(ifaceName);
                            throw new Error("Inexistant interface name in newIdMap");
                        }
                        return new new_id_map_1.newIdMap[ifaceName](this, args, ifaceName, newOid, parent, version);
                    },
                    call(object, fnName, args) {
                        const methodCollection = object;
                        object.emit(`before${fnName[0].toUpperCase()}${fnName.slice(1)}`, args);
                        if (fnName in methodCollection)
                            methodCollection[fnName](args);
                        object.emit(fnName, args);
                    },
                });
            },
        });
        this.metadata = metadata;
    }
    async start() {
        const xdgRuntimeDir = process.env.XDG_RUNTIME_DIR;
        if (typeof xdgRuntimeDir !== "string")
            throw new Error();
        const lastInUse = Math.max(...(await (0, promises_1.readdir)(xdgRuntimeDir))
            .filter((v) => v.match(/^wayland-\d+$/))
            .map((v) => Number(v.slice('wayland-'.length)))); // Look im tired ok.
        this.params.socketPath = `${process.env.XDG_RUNTIME_DIR}/wayland-${lastInUse + 1}`;
        super.start();
    }
}
exports.HLCompositor = HLCompositor;
class HLConnection extends wl_serv_low_1.Connection {
    time = new time_1.Time();
    // Fucking hell.
    // (I promise I tried.)
    get hlCompositor() { return this.compositor; }
    display;
    serial = new serialAuthority_1.SerialAuthority();
    constructor(connId, comp, sock, params) {
        super(connId, comp, sock, params);
        // this.objects = new Map([[1, new WlDisplay(this, 1, null, {})]]);
        this.display = this.createObjRef({}, 'wl_display', 1);
        this.createObject(this.display);
        // Handle client disconnect
        sock.on("end", function () {
            const deleteMe = [...this.objects.values()];
            for (let i = deleteMe.length - 1; i >= 1; i -= 1) {
                deleteMe[i].wlDestroy();
            }
        }.bind(this));
        // this.hlCompositor.metadata.wl_registry.outputs.addConnection(this);
        // this.hlCompositor.metadata.wl_registry.seats.addConnection(this);
    }
}
exports.HLConnection = HLConnection;
