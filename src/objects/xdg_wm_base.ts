import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgSurface } from "./xdg_surface.js";
import { XdgPositioner } from "./xdg_positioner.js";

export class XdgWmBase extends BaseObject {
  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);
  }
  wlGetXdgSurface(args: { id: NewObjectDescriptor, surface: WlSurface }) {
    const xdgSurface = new XdgSurface(args.id, args.surface);
    this.connection.createObject(xdgSurface);

    args.surface.xdgSurface = xdgSurface;
  }
  wlCreatePositioner(args: { id: NewObjectDescriptor }) {
    this.connection.createObject(new XdgPositioner(args.id));
  }
}
