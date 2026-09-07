import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlOutput } from "./wl_output.js";
import { WlSeat } from "./wl_seat.js";
import { WlCompositor } from "./wl_compositor.js";
import { WlSubcompositor } from "./wl_subcompositor.js";
import { WlShm } from "./wl_shm.js";
import { WlDataDeviceManager } from "./wl_data_device_manager.js";
import { XdgWmBase } from "./xdg_wm_base.js";
import { ZxdgDecorationManagerV1 } from "./zxdg_decoration_manager_v1.js";
import { ZwpLinuxDmabufV1 } from "./zwp_linux_dmabuf_v1.js";
import { OutputConfiguration, OutputRegistry } from "../registries/objectRegistry/output.js";
import { SeatConfiguration, SeatRegistry } from "../registries/objectRegistry/seat.js";
import { StrutRegistry } from "../registries/conceptRegistry/strut.js";
import $ from "informa";

export interface WlRegistryMetadata {
  outputs: OutputRegistry;
  seats: SeatRegistry;
  struts: StrutRegistry;
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
  zwp_linux_dmabuf_v1: ZwpLinuxDmabufV1,
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
    'zwp_linux_dmabuf_v1',
  ]

  static supportedByRegistry = [
    ...WlRegistry.baseRegistry,
    'wl_seat',
    'wl_output',
  ]

  contents: (string | null)[] = [...WlRegistry.baseRegistry];

  latestRegistryName = WlRegistry.baseRegistry.length - 1;
  getRegistryName() {
    this.latestRegistryName += 1;
    return this.latestRegistryName;
  }

  outputRegistry: OutputRegistry;
  outputConfigByName = new Map<number, OutputConfiguration>();
  outputRegistryOnAdd(config: OutputConfiguration) {
    const name = this.getRegistryName();
    this.outputConfigByName.set(name, config);

    this.contents[name] = 'wl_output';
  }
  outputRegistryOnDelete(config: OutputConfiguration) {
    for (const [name, configInMap] of this.outputConfigByName.entries()) {
      if (configInMap === config) {
        this.contents[name] = null;
        this.outputConfigByName.delete(name);

        return;
      }
    }
  }

  seatRegistry: SeatRegistry;
  seatConfigByName = new Map<number, SeatConfiguration>();
  seatRegistryOnAdd(config: SeatConfiguration) {
    const name = this.getRegistryName();
    this.seatConfigByName.set(name, config);

    this.contents[name] = 'wl_seat';
  }
  seatRegistryOnDelete(config: SeatConfiguration) {
    for (const [name, configInMap] of this.seatConfigByName.entries()) {
      if (configInMap === config) {
        this.contents[name] = null;
        this.seatConfigByName.delete(name);

        return;
      }
    }
  }

  constructor(initCtx: NewObjectDescriptor) {
    // if (conx.registry) return conx.registry;
    super(initCtx);

    this.outputRegistry = this.connection.display.outputRegistry;
    for (const outputAuth of this.outputRegistry.keys()) {
      const nextIdx = this.getRegistryName();
      this.contents[nextIdx] = 'wl_output';
      this.outputConfigByName.set(nextIdx, outputAuth);
    }
    $.onAddEntry(() => this.outputRegistry, this.outputRegistryOnAdd);
    $.onDeleteEntry(() => this.outputRegistry, this.outputRegistryOnDelete);

    this.seatRegistry = this.connection.display.seatRegistry;
    for (const seatAuth of this.seatRegistry.keys()) {
      const nextIdx = this.getRegistryName();
      this.contents[nextIdx] = 'wl_seat';
      this.seatConfigByName.set(nextIdx, seatAuth);
    }
    $.onAddEntry(() => this.seatRegistry, this.seatRegistryOnAdd);
    $.onDeleteEntry(() => this.seatRegistry, this.seatRegistryOnDelete);

    for (const numericName in this.contents) {
      const name = this.contents[numericName];
      if (!name) continue;
      const iface = interfaces[name];
      this.connection.addCommand(this, 'global', { name: numericName, interface: iface.name, version: iface.version });
    }
  }

  wlDestroy(): void {
    $.offAddEntry(() => this.outputRegistry, this.outputRegistryOnAdd);
    $.offDeleteEntry(() => this.outputRegistry, this.outputRegistryOnDelete);
    $.offAddEntry(() => this.seatRegistry, this.seatRegistryOnAdd);
    $.offDeleteEntry(() => this.seatRegistry, this.seatRegistryOnDelete);

    super.wlDestroy();
  }

  wlBind(args: { id: NewObjectDescriptor, name: number }) {
    const ifaceName = args.id.type;
    const isInNewIdMap = (val: string): val is keyof typeof newIdMap => val in newIdMap;
    if (!isInNewIdMap(ifaceName)) return this.raiseError('invalid_method', "No such interface in registry");

    this.connection.createObject(new newIdMap[ifaceName](args.id, args.name));
  }
}
