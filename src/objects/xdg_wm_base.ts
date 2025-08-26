import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgSurface } from "./xdg_surface.js";

export class XdgWmBase extends BaseObject {
  wlSurface: WlSurface;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.wlSurface = args.surface;
  }
  wlGetXdgSurface(args: { id: XdgSurface, surface: WlSurface }) {
    args.surface.xdgSurface = args.id;
  }
}
