import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlShmPool } from "./wl_shm_pool.js";

export class WlShm extends BaseObject {
  static supportedFormats = [
    'argb8888',
    'xrgb8888',
  ];

  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);

    for (const format of WlShm.supportedFormats)
      this.addCommand('format', { format: interfaces['wl_shm'].enums.format.atoi[format] });
  }

  wlCreatePool(args: { id: NewObjectDescriptor, size: number, fd: number }) {
    this.connection.createObject(new WlShmPool(args.id, { size: args.size, fd: args.fd }));
  }
}
