import { WlCallback } from "./wl_callback.js";
import { BaseObject, NewObjectDescriptorWithConx } from "./base_object.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { WlRegistry } from "./wl_registry.js";
import { OutputAuthority, OutputRegistry } from "../registries/output.js";
import { SeatAuthority, SeatRegistry } from "../registries/seat.js";
import { OutputConfiguration } from "./wl_output.js";
import { SeatConfiguration } from "./wl_seat.js";

export class WlDisplay extends BaseObject {
  _version: number = 1;

  outputRegistry: OutputRegistry;

  seatRegistry: SeatRegistry;

  outputRegistryOnAdd(config: OutputConfiguration) {
    this.outputRegistry.get(config)!.create(this.connection);
  }
  seatRegistryOnAdd(config: SeatConfiguration) {
    this.seatRegistry.get(config)!.create(this.connection);
  }

  constructor(initCtx: NewObjectDescriptorWithConx) {
    super(initCtx);

    const regMeta = this.connection.hlCompositor.metadata.wl_registry;

    // for (const output of regMeta.outputs) {
    //   const outputAuth = new OutputAuthority(output, this.connection);
    //   this.outputAuthorities.set(output, outputAuth);
    // }
    this.outputRegistry = regMeta.outputs;

    this.seatRegistry = regMeta.seats;
  }

  wlSync(args: { callback: NewObjectDescriptor }) {
    const callback = new WlCallback(args.callback);
    this.connection.createObject(callback);

    callback.done(1);
    // console.log('AAAA')
    this.connection.sendPending();
  }
  wlGetRegistry(args: { registry: NewObjectDescriptor }) {
    this.connection.createObject(new WlRegistry(args.registry));
  }

  wlDestroy(): void {
    this.outputRegistry.on('add', this.outputRegistryOnAdd);
    this.seatRegistry.on('add', this.seatRegistryOnAdd);
  }
}
