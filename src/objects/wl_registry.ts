import { interfaces } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { OutputAuthority, OutputConfiguration } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration } from "./wl_seat.js";

export interface WlRegistryMetadata {
  outputs: OutputConfiguration[];
  seats: SeatConfiguration[];
}

// TODO: REFACTOR (WTF!!)
// TODO contents:
// These are supposed to be *global* objects
// These are not supposed to be "one per connection"
// Also removes the need for ../lib/specificregistry.ts

export class WlRegistry extends BaseObject {
  get registry() { return this; }

  static baseRegistry: (string | null)[] = [
    null,
    'wl_compositor',
    'wl_shm',
    'wl_subcompositor',
    'xdg_wm_base',
    'wl_data_device_manager',
  ]

  static supportedByRegistry = [
    ...WlRegistry.baseRegistry,
    'wl_seat',
    'wl_output',
  ]

  contents: (string | null)[] = [...WlRegistry.baseRegistry];

  outputAuthoritiesByName: Map<number, OutputAuthority> = new Map();
  seatAuthoritiesByName: Map<number, SeatAuthority> = new Map();

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    // if (conx.registry) return conx.registry;
    super(conx, args, ifaceName, oid, parent, version);

    for (const outputAuth of this.connection.display.outputAuthorities.values()) {
      const nextIdx = this.contents.length;
      this.contents[nextIdx] = 'wl_output';
      this.outputAuthoritiesByName.set(nextIdx, outputAuth);
    }

    for (const seatAuth of this.connection.display.seatAuthorities.values()) {
      const nextIdx = this.contents.length;
      this.contents[nextIdx] = 'wl_seat';
      this.seatAuthoritiesByName.set(nextIdx, seatAuth);
    }

    for (const numericName in this.contents) {
      const name = this.contents[numericName];
      if (!name) continue;
      const iface = interfaces[name];
      conx.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
    }
  }

  // wlDestroy(): void {
  //   const regMeta = this.connection.hlCompositor.metadata.wl_registry;

  //   regMeta.outputs.unapplyTo(this);
  //   regMeta.seats.unapplyTo(this);
  // }

  wlBind({ id }: { id: BaseObject }) {}
}
