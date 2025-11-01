import { WlCallback } from "./wl_callback.js";
import { BaseObject, NewObjectDescriptorWithConx } from "./base_object.js";
import { OutputAuthority, OutputConfiguration } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration } from "./wl_seat.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { WlRegistry } from "./wl_registry.js";

export class WlDisplay extends BaseObject {
  _version: number = 1;

  outputAuthorities: Map<OutputConfiguration, OutputAuthority> = new Map();

  seatAuthorities: Map<SeatConfiguration, SeatAuthority> = new Map();

  constructor(initCtx: NewObjectDescriptorWithConx) {
    super(initCtx);

    const regMeta = this.connection.hlCompositor.metadata.wl_registry;

    for (const output of regMeta.outputs) {
      const outputAuth = new OutputAuthority(output, this.connection);
      this.outputAuthorities.set(output, outputAuth);
    }

    for (const seat of regMeta.seats) {
      const seatAuth = new SeatAuthority(seat, this.connection);
      this.seatAuthorities.set(seat, seatAuth);
    }
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

  wlDestroy(): void {}
}
