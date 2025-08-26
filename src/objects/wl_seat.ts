import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { BaseObject } from "./base_object.js";
import { SpecificRegistry } from "../lib/specific_registry";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";

export interface SeatConfiguration {
  name: string;
  capabilities: number;
}

const name = 'wl_seat' as const;

type SeatServerToClient = {
  'enter': [WlSurface, number, number];
  'moveTo': [number, number];
  'leave': [WlSurface];
  'buttonDown': [number];
  'buttonUp': [number];
  'focus': [WlSurface];
  'blur': [WlSurface];
};
export type SeatEventServer = EventServer<SeatServerToClient, {}>;
export type SeatEventClient = EventClient<{}, SeatServerToClient>;
export class SeatRegistry extends SpecificRegistry<SeatConfiguration, SeatEventServer> {
  get iface() { return name }
}

export class WlSeat extends BaseObject {
  info: SeatConfiguration;
  seatRegistry: SeatRegistry;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.seatRegistry = this.registry!.seatRegistry;
    this.info = this.seatRegistry.map.get(args.name)!;

    this.addCommand('name', { name: this.info.name });
    this.addCommand('capabilities', { capabilities: this.info.capabilities });
  }
}
