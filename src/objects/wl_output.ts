import { EventEmitter } from "node:stream";
import { BaseObject } from "./base_object.js";
import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { SpecificRegistry } from "../lib/specific_registry.js";
import { WlSurface } from "./wl_surface.js";
import { Connection, interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";

const name = 'wl_output' as const;

type OutputServerToClient = { 'update': [], 'enter': [WlSurface] };
export type OutputEventServer = EventServer<OutputServerToClient, {}>;
export type OutputEventClient = EventClient<{}, OutputServerToClient>;
export class OutputRegistry extends SpecificRegistry<OutputConfiguration, OutputEventServer> {
  get iface() { return name }

  current: OutputConfiguration;

  constructor(v: OutputConfiguration[], current: OutputConfiguration = v[0]){
    super(v);
    this.current = current;
  }
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
  recipient: OutputEventClient;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    const outputReg = this.registry!.outputRegistry;
    this.info = outputReg.map.get(args.name)!;

    this.recipient = outputReg.transports.get(conx)!.get(this.info)!.createRecipient();

    this.advertise();
    this.recipient.on('update', this.advertise.bind(this));
    this.recipient.on('enter', function (this: WlOutput, surf: WlSurface) {
      surf.addCommand('enter', { output: this });
      this.connection.sendPending();
    }.bind(this));
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
      refresh: 60, // again idrc for now
    });
    this.addCommand('scale', { factor: 1 });
    this.addCommand('done', {});
  }

  release() { this.recipient.destroy(); }
}
