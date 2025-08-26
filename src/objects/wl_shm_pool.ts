import mmap from "@cathodique/mmap-io";
import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { HLConnection } from "../index.js";

const name = 'wl_shm_pool' as const;
export class WlShmPool extends BaseObject {
  size: number;
  fd: number;

  daughterBuffers: Set<WlBuffer> = new Set();

  bufferId: number;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    const readwrite = (mmap.PROT_READ | mmap.PROT_WRITE) as 3;
    this.bufferId = mmap.map(args.size, readwrite, mmap.MAP_SHARED, args.fd);
    this.size = args.size;
    this.fd = args.fd;
  }

  wlResize(args: Record<string, any>) {
    mmap.unmap(this.bufferId);
    this.size = args.size;
    this.bufferId = mmap.map(this.size, mmap.PROT_READ, mmap.MAP_SHARED, this.fd, 0);
  }

  // wlDestroy(): void {
  //   mmap.unmap(this.bufferId);
  //   TODO: Unmap when appropriate
  // }
}
