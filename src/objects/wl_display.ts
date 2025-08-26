import { WlCallback } from "./wl_callback.js";
import { BaseObject } from "./base_object.js";

const name = 'wl_display' as const;
export class WlDisplay extends BaseObject {
  _version: number = 1;

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
