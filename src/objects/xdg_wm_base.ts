import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgSurface } from "./xdg_surface.js";

export class XdgWmBase extends BaseObject {
  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);
  }
  wlGetXdgSurface(args: { id: NewObjectDescriptor, surface: WlSurface }) {
    // TODO: git refactor-object-creation : Create object
    args.surface.xdgSurface = args.id;
  }
  wlCreatePositioner(args: { id: NewObjectDescriptor }) {
    // TODO: git refactor-object-creation : Create object
  }
}
