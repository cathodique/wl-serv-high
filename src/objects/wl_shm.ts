import { interfaces } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";

export class WlShm extends BaseObject {
  static supportedFormats = [
    'argb8888',
    'xrgb8888',
  ];

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    for (const format of WlShm.supportedFormats)
      this.addCommand('format', { format: interfaces['wl_shm'].enums.format.atoi[format] });
  }

  wlCreatePool() { }
}
