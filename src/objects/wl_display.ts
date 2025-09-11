import { WlCallback } from "./wl_callback.js";
import { BaseObject } from "./base_object.js";
import { HLConnection } from "../index.js";
import { OutputAuthority, OutputConfiguration } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration } from "./wl_seat.js";

export class WlDisplay extends BaseObject {
  _version: number = 1;

  outputAuthorities: Map<OutputConfiguration, OutputAuthority> = new Map();

  seatAuthorities: Map<SeatConfiguration, SeatAuthority> = new Map();

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    const regMeta = this.connection.hlCompositor.metadata.wl_registry;

    for (const output of regMeta.outputs) {
      const outputAuth = new OutputAuthority(output);
      this.outputAuthorities.set(output, outputAuth);
    }

    for (const seat of regMeta.seats) {
      const seatAuth = new SeatAuthority(seat);
      this.seatAuthorities.set(seat, seatAuth);
    }
  }

  wlSync(args: { callback: WlCallback }) {
    args.callback.done(1);
    // console.log('AAAA')
    this.connection.sendPending();
  }
  // wlGetRegistry(args: { registry: WlRegistry }) {
  //   this.connection.registry = args.registry;
  // }

  wlDestroy(): void {}
}
