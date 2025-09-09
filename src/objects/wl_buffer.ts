import { HLConnection } from "../index.js";
import { colorspaces } from "../misc/colorspaces.js";
import { BaseObject } from "./base_object.js";
import { WlShmPool } from "./wl_shm_pool.js";
import mmap from "@cathodique/mmap-io";
import { interfaces } from "@cathodique/wl-serv-low";
import type { ObjectReference } from "@cathodique/wl-serv-low";
import { WlSurface } from "./wl_surface.js";

export interface WlBufferMetadata {

}

export class WlBuffer extends BaseObject {
  offset: number;
  width: number;
  height: number;
  stride: number;
  format: number;

  surface?: WlSurface;
  buffer: Buffer;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (this.parent.iface != "wl_shm_pool") throw new Error('wl_buffer must only be created using wl_shm_pool.create_buffer');
    (this.parent as WlShmPool).daughterBuffers.add(this);

    this.offset = args.offset;
    this.width = args.width;
    this.height = args.height;
    this.stride = args.stride;
    this.format = args.format;

    this.buffer = Buffer.alloc(this.size);
  }

  wlDestroy() {
    (this.parent as WlShmPool).daughterBuffers.delete(this);
    if (this.surface && this.surface.buffer.pending === this) this.surface.buffer.pending = null;

    super.wlDestroy();
  }

  get pixelSize() {
    return colorspaces[
      interfaces.wl_shm.enums.format.itoa[this.format] as keyof typeof colorspaces
    ].bytesPerPixel;
  }
  get size() {
    return Math.max(this.stride * (this.height - 1) + this.width * this.pixelSize, 0);
  }

  // getBuffer() {
  //   return mmap.getbuffer((this.parent as WlShmPool).bufferId);
  // }

  getBoundedRect(y: number, x: number, h: number, w: number) {
    return [Math.min(h, this.height - y), Math.min(w, this.width - x)];
  }

  getBufferArea(y: number, x: number, h: number, w: number) {
    return mmap.getbufferarea(
      (this.parent as WlShmPool).bufferId,
      y,
      x,
      Math.min(h, this.height - y),
      Math.min(w, this.width - x),
      this.stride,
      this.pixelSize,
    );
  }
  updateBufferArea(y: number, x: number, h: number, w: number) {
    return mmap.updatebufferarea(
      (this.parent as WlShmPool).bufferId,
      this.buffer,
      y,
      x,
      Math.min(h, this.height - y),
      Math.min(w, this.width - x),
      this.stride,
      this.pixelSize,
    );
  }

  // getByte(i: number) {
  //   // console.log((this.parent as WlShmPool).size);
  //   return mmap.getbyte((this.parent as WlShmPool).bufferId, i + this.offset);
  // }
}
