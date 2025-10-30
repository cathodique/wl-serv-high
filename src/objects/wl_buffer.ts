import { colorspaces } from "../misc/colorspaces.js";
import { BaseObject } from "./base_object.js";
import { WlShmPool } from "./wl_shm_pool.js";
import mmap from "@cathodique/mmap-io";
import { interfaces } from "@cathodique/wl-serv-low";
import type { NewObjectDescriptor, ObjectReference } from "@cathodique/wl-serv-low";
import { WlSurface } from "./wl_surface.js";

interface WlBufferArgs {
  offset: number;
  width: number;
  height: number;
  stride: number;
  format: number;
}

export class WlBuffer extends BaseObject {
  meta: WlBufferArgs;

  surface?: WlSurface;
  buffer: Buffer;
  parent: WlShmPool;

  constructor(initCtx: NewObjectDescriptor, args: WlBufferArgs) {
    super(initCtx);

    if (!(initCtx.parent instanceof WlShmPool)) throw new Error('wl_buffer must only be created using wl_shm_pool.create_buffer');
    this.parent = initCtx.parent;

    this.parent.daughterBuffers.add(this);

    this.meta = args;

    this.buffer = Buffer.alloc(this.size);
  }

  wlDestroy() {
    this.parent.daughterBuffers.delete(this);
    if (this.surface && this.surface.buffer.pending === this) this.surface.buffer.pending = null;

    super.wlDestroy();
  }

  get pixelSize() {
    return colorspaces[
      interfaces.wl_shm.enums.format.itoa[this.meta.format] as keyof typeof colorspaces
    ].bytesPerPixel;
  }
  get size() {
    return Math.max(this.meta.stride * (this.meta.height - 1) + this.meta.width * this.pixelSize, 0);
  }

  // getBuffer() {
  //   return mmap.getbuffer((this.parent as WlShmPool).bufferId);
  // }

  getBoundedRect(y: number, x: number, h: number, w: number) {
    return [Math.min(h, this.meta.height - y), Math.min(w, this.meta.width - x)];
  }

  getBufferArea(y: number, x: number, h: number, w: number) {
    return mmap.getbufferarea(
      this.parent.bufferId,
      y,
      x,
      Math.min(h, this.meta.height - y),
      Math.min(w, this.meta.width - x),
      this.meta.stride,
      this.pixelSize,
    );
  }
  updateBufferArea(y: number, x: number, h: number, w: number) {
    return mmap.updatebufferarea(
      this.parent.bufferId,
      this.buffer,
      y,
      x,
      Math.min(h, this.meta.height - y),
      Math.min(w, this.meta.width - x),
      this.meta.stride,
      this.pixelSize,
    );
  }

  // getByte(i: number) {
  //   // console.log((this.parent as WlShmPool).size);
  //   return mmap.getbyte((this.parent as WlShmPool).bufferId, i + this.offset);
  // }
}
