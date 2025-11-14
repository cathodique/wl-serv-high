import { OutputInstances } from "../registries/output.js";
import { BaseObject } from "./base_object.js";
import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";

export interface OutputConfiguration {
  x: number;
  y: number;
  w: number;
  h: number;
  effectiveW: number;
  effectiveH: number;
}

export class WlOutput extends BaseObject {
  info: OutputConfiguration;
  outputInstances: OutputInstances;

  constructor(initCtx: NewObjectDescriptor, outputName: number) {
    super(initCtx);

    this.info = this.registry!.outputConfigByName.get(outputName)!;
    this.outputInstances = this.registry!.outputRegistry.get(this.info)!.get(this.connection)!;
    this.outputInstances.bind(this);

    this.advertise();
  }

  advertise() {
    // TODO: FIX THIS MESS
    this.addCommand('geometry', {
      x: this.info.x,
      y: this.info.y,
      physicalWidth: this.info.w / 3.8,
      physicalHeight: this.info.h / 3.8,
      subpixel: interfaces.wl_output.enums.subpixel.atoi.horizontal_rgb,
      make: 'IDK',
      model: 'IDK As if I knew',
      transform: interfaces.wl_output.enums.transform.atoi.normal,
    });
    this.addCommand('mode', {
      flags: 3, // idc i just wann move on
      width: this.info.w,
      height: this.info.h,
      refresh: 60000, // again idrc for now
    });
    this.addCommand('scale', { factor: 1 });
    this.addCommand('done', {});
  }
}
