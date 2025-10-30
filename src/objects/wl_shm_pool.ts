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

    const readwrite = (mmap.PROT_READ | mmap.PROT_WRITE) as 3;
    this.bufferId = mmap.map(args.size, readwrite, mmap.MAP_SHARED, args.fd);
    this.meta = args;
  }

  wlResize(args: Record<string, any>) {
    mmap.unmap(this.bufferId);
    this.meta.size = args.size;
    this.bufferId = mmap.map(this.meta.size, mmap.PROT_READ, mmap.MAP_SHARED, this.meta.fd, 0);
  }

  wlCreateBuffer() {
    // TODO: git refactor-object-creation : Create object
  }
}
