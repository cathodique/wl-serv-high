import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { OutputAuthority, OutputConfiguration, WlOutput } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration, WlSeat } from "./wl_seat.js";
import { WlCompositor } from "./wl_compositor.js";
import { WlSubcompositor } from "./wl_subcompositor.js";
import { WlShm } from "./wl_shm.js";
import { WlDataDeviceManager } from "./wl_data_device_manager.js";
import { XdgWmBase } from "./xdg_wm_base.js";
import { ZxdgDecorationManagerV1 } from "./zxdg_decoration_manager_v1.js";

export interface WlRegistryMetadata {
  outputs: OutputConfiguration[];
  seats: SeatConfiguration[];
}

const newIdMap = {
  wl_compositor: WlCompositor,
  wl_shm: WlShm,
  wl_subcompositor: WlSubcompositor,
  wl_data_device_manager: WlDataDeviceManager,
  wl_seat: WlSeat,
  wl_output: WlOutput,
  xdg_wm_base: XdgWmBase,
  zxdg_decoration_manager_v1: ZxdgDecorationManagerV1,
};

// TODO: REFACTOR (WTF!!)

export class WlRegistry extends BaseObject {
  get registry() { return this; }

  static baseRegistry: (string | null)[] = [
    null,
    'wl_compositor',
    'wl_shm',
    'wl_subcompositor',
    'wl_data_device_manager',
    'xdg_wm_base',
    'zxdg_decoration_manager_v1',
  ]

  static supportedByRegistry = [
    ...WlRegistry.baseRegistry,
    'wl_seat',
    'wl_output',
  ]

  contents: (string | null)[] = [...WlRegistry.baseRegistry];

  outputAuthoritiesByName: Map<number, OutputAuthority> = new Map();
  seatAuthoritiesByName: Map<number, SeatAuthority> = new Map();

  constructor(initCtx: NewObjectDescriptor) {
    // if (conx.registry) return conx.registry;
    super(initCtx);

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
      this.connection.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
    }
  }

  // wlDestroy(): void {
  //   const regMeta = this.connection.hlCompositor.metadata.wl_registry;

  //   regMeta.outputs.unapplyTo(this);
  //   regMeta.seats.unapplyTo(this);
  // }

  wlBind(args: { id: NewObjectDescriptor, name: number }) {
    const ifaceName = args.id.type;
    const isInNewIdMap = (val: string): val is keyof typeof newIdMap => val in newIdMap;
    if (!isInNewIdMap(ifaceName)) return this.connection.display.raiseError('invalid_method', "No such interface in registry");

    this.connection.createObject(new newIdMap[ifaceName](args.id, args.name));
  }
}
