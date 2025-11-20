import mmap from "@cathodique/mmap-io";
import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";

interface WlShmPoolArgs {
  size: number;
  fd: number;
}

export class WlShmPool extends BaseObject {
  meta: WlShmPoolArgs;

  daughterBuffers: Set<WlBuffer> = new Set();

  bufferId: number;

  constructor(initCtx: NewObjectDescriptor, args: WlShmPoolArgs) {
    super(initCtx);

    const readwrite = (mmap.default.PROT_READ | mmap.default.PROT_WRITE) as 3;
    this.bufferId = mmap.default.map(args.size, readwrite, mmap.default.MAP_SHARED, args.fd);
    this.meta = args;
  }

  wlResize(args: Record<string, any>) {
    mmap.default.unmap(this.bufferId);
    this.meta.size = args.size;
    this.bufferId = mmap.default.map(this.meta.size, mmap.default.PROT_READ, mmap.default.MAP_SHARED, this.meta.fd, 0);
  }

  wlCreateBuffer(args: { id: NewObjectDescriptor, offset: number, width: number, height: number, stride: number, format: number }) {
    this.connection.createObject(
      new WlBuffer(args.id, {
        offset: args.offset,
        width: args.width,
        height: args.height,
        stride: args.stride,
        format: args.format,
      })
    );
  }
}
