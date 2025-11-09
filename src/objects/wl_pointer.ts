import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";

export class WlPointer extends BaseObject {
  currentSurface?: WlSurface;

  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);
  }

  wlSetCursor({ surface }: { surface: WlSurface }) {
    if (surface) surface.setRole("cursor");
    else if (this.currentSurface) this.currentSurface.dropRole();
    this.currentSurface = surface;
  }
}
