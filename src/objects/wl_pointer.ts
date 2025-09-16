import { ObjectReference } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSeat } from "./wl_seat.js";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";


export class WlPointer extends BaseObject {
  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (!(parent instanceof WlSeat)) throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');
  }

  wlSetCursor({ surface }: { surface: WlSurface }) {
    surface.setRole("cursor");
  }
}
