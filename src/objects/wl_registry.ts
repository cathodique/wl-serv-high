import { interfaces } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { OutputRegistry } from "./wl_output.js";
import { SeatRegistry } from "./wl_seat.js";

export interface WlRegistryMetadata {
  outputs: OutputRegistry;
  seats: SeatRegistry;
}

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
  outputRegistry: OutputRegistry;
  seatRegistry: SeatRegistry;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    // if (conx.registry) return conx.registry;
    super(conx, args, ifaceName, oid, parent, version);

    const regMeta = this.connection.hlCompositor.metadata.wl_registry;

    regMeta.outputs.applyTo(this);
    this.outputRegistry = regMeta.outputs;

    regMeta.seats.applyTo(this);
    this.seatRegistry = regMeta.seats;

    for (const numericName in this.contents) {
      const name = this.contents[numericName];
      if (!name) continue;
      const iface = interfaces[name];
      conx.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
    }
  }

  wlBind() { }
  wlGetRegistry() { }
}
