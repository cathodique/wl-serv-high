"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlBuffer = void 0;
const colorspaces_js_1 = require("../misc/colorspaces.js");
const base_object_js_1 = require("./base_object.js");
const mmap_io_1 = __importDefault(require("@cathodique/mmap-io"));
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
class WlBuffer extends base_object_js_1.BaseObject {
    offset;
    width;
    height;
    stride;
    format;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        if (this.parent.iface != "wl_shm_pool")
            throw new Error('wl_buffer must only be created using wl_shm_pool.create_buffer');
        this.parent.daughterBuffers.add(this);
        this.offset = args.offset;
        this.width = args.width;
        this.height = args.height;
        this.stride = args.stride;
        this.format = args.format;
    }
    wlRelease() {
        this.parent.daughterBuffers.delete(this);
    }
    get pixelSize() {
        return colorspaces_js_1.colorspaces[wl_serv_low_1.interfaces.wl_shm.enums.format.itoa[this.format]].bytesPerPixel;
    }
    get size() {
        return Math.max(this.stride * (this.height - 1) + this.width * this.pixelSize, 0);
    }
    getBuffer() {
        return mmap_io_1.default.getbuffer(this.parent.bufferId);
    }
    getByte(i) {
        // console.log((this.parent as WlShmPool).size);
        return mmap_io_1.default.getbyte(this.parent.bufferId, i + this.offset);
    }
}
exports.WlBuffer = WlBuffer;
