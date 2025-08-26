"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlShmPool = void 0;
const mmap_io_1 = __importDefault(require("@cathodique/mmap-io"));
const base_object_js_1 = require("./base_object.js");
const name = 'wl_shm_pool';
class WlShmPool extends base_object_js_1.BaseObject {
    size;
    fd;
    daughterBuffers = new Set();
    bufferId;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        const readwrite = (mmap_io_1.default.PROT_READ | mmap_io_1.default.PROT_WRITE);
        this.bufferId = mmap_io_1.default.map(args.size, readwrite, mmap_io_1.default.MAP_SHARED, args.fd);
        this.size = args.size;
        this.fd = args.fd;
    }
    wlResize(args) {
        mmap_io_1.default.unmap(this.bufferId);
        this.size = args.size;
        this.bufferId = mmap_io_1.default.map(this.size, mmap_io_1.default.PROT_READ, mmap_io_1.default.MAP_SHARED, this.fd, 0);
    }
}
exports.WlShmPool = WlShmPool;
