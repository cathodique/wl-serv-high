import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { BaseObject } from "./base_object.js";
// import { SpecificRegistry } from "../lib/specific_registry";
import { HLConnection } from "../index.js";
import { WlPointer } from "./wl_pointer.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";

export interface SeatConfiguration {
  name: string;
  capabilities: number;
}

const name = 'wl_seat' as const;

// Edit from future me: What the fuck??
// type SeatServerToClient = {
//   'enter': [WlSurface, number, number];
//   'moveTo': [number, number];
//   'leave': [WlSurface];
//   'buttonDown': [number];
//   'buttonUp': [number];
//   'modifier': [WlSurface, number, number, number, ];
//   'focus': [WlSurface, number[]];
//   'blur': [WlSurface];
// };
// type SeatServerToClient = {};
// export type SeatEventServer = EventServer<SeatServerToClient, {}>;
// export type SeatEventClient = EventClient<{}, SeatServerToClient>;

export class SeatAuthority extends ObjectAuthority<WlSeat, SeatConfiguration> {}

export class WlSeat extends BaseObject {
  info: SeatConfiguration;
  authority: SeatAuthority;

  // latestSerial: number | null = null;

  pointers: Set<WlPointer> = new Set();
  keyboards: Set<WlKeyboard> = new Set();

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.authority = this.registry!.seatAuthorities.get(args.name)!;
    this.authority.bind(this);
    this.info = this.authority.config;

    this.addCommand('name', { name: this.info.name });
    this.addCommand('capabilities', { capabilities: this.info.capabilities });
  }

  wlGetPointer({ id: pointer }: { id: WlPointer }) {
    this.pointers.add(pointer);
  }
  wlGetKeyboard({ id: keyboard }: { id: WlKeyboard }) {
    this.keyboards.add(keyboard);
  }

  addCommandToPointers(eventName: string, args: Record<string, any>): void {
    for (const pointer of this.pointers) {
      pointer.addCommand(eventName, args);
    }
  }
  addCommandToKeyboards(eventName: string, args: Record<string, any>): void {
    for (const keyboard of this.keyboards) {
      keyboard.addCommand(eventName, args);
    }
  }
}
