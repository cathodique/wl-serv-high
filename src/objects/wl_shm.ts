import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";

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

  wlCreatePool() {
    // TODO: git refactor-object-creation : Create object
  }
}
