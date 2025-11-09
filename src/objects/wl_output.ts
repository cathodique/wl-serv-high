import { BaseObject } from "./base_object.js";
import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { ObjectAuthority } from "../lib/objectAuthority.js";

export class OutputAuthority extends ObjectAuthority<WlOutput, OutputConfiguration> {
}

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
  authority: OutputAuthority;

  constructor(initCtx: NewObjectDescriptor, outputName: number) {
    super(initCtx);

    this.authority = this.registry!.outputAuthoritiesByName.get(outputName)!;
    this.authority.bind(this);
    this.info = this.authority.config;

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
