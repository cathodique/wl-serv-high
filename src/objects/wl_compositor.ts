import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { WlRegion } from "./wl_region.js";

export class WlCompositor extends BaseObject {
  wlCreateSurface(args: { id: NewObjectDescriptor }) {
    this.connection.createObject(new WlSurface(args.id));
  }
  wlCreateRegion(args: { id: NewObjectDescriptor }) {
    this.connection.createObject(new WlRegion(args.id));
  }
}
