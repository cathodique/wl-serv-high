import { HLConnection } from "../index.js";
import { colorspaces } from "../misc/colorspaces.js";
import { BaseObject } from "./base_object.js";
import { WlShmPool } from "./wl_shm_pool.js";
import mmap from "@cathodique/mmap-io";
import { interfaces } from "@cathodique/wl-serv-low";
import type { ObjectReference } from "@cathodique/wl-serv-low";

export interface WlBufferMetadata {

}

export class WlBuffer extends BaseObject {
  offset: number;
  width: number;
  height: number;
  stride: number;
  format: number;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (this.parent.iface != "wl_shm_pool") throw new Error('wl_buffer must only be created using wl_shm_pool.create_buffer');
    (this.parent as WlShmPool).daughterBuffers.add(this);

    this.offset = args.offset;
    this.width = args.width;
    this.height = args.height;
    this.stride = args.stride;
    this.format = args.format;
  }

  wlRelease() {
    (this.parent as WlShmPool).daughterBuffers.delete(this);
  }

  get pixelSize() {
    return colorspaces[
      interfaces.wl_shm.enums.format.itoa[this.format] as keyof typeof colorspaces
    ].bytesPerPixel;
  }
  get size() {
    return Math.max(this.stride * (this.height - 1) + this.width * this.pixelSize, 0);
  }

  getBuffer() {
    return mmap.getbuffer((this.parent as WlShmPool).bufferId);
  }

  getByte(i: number) {
    // console.log((this.parent as WlShmPool).size);
    return mmap.getbyte((this.parent as WlShmPool).bufferId, i + this.offset);
  }
}
