import { BaseObject } from "./base_object.js";
import { interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";

// type OutputServerToClient = { 'update': [], 'enter': [WlSurface] };
// export type OutputEventServer = EventServer<OutputServerToClient, {}>;
// export type OutputEventClient = EventClient<{}, OutputServerToClient>;
// export class OutputRegistry {
//   get iface() { return name }

//   current: OutputConfiguration;

//   constructor(v: OutputConfiguration[], current: OutputConfiguration = v[0]){


//     this.current = current;
//   }
// }

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

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.authority = this.registry!.outputAuthoritiesByName.get(args.name)!;
    this.authority.bind(this);
    this.info = this.authority.config;

    this.advertise();
    // this.recipient.on('update', this.advertise.bind(this));
    // this.recipient.on('enter', function (this: WlOutput, surf: WlSurface) {
    // }.bind(this));
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
