import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { WlSubsurface } from "./wl_subsurface.js";

export class WlSubcompositor extends BaseObject {
  wlGetSubsurface(args: { id: NewObjectDescriptor, surface: WlSurface, parent: WlSurface }) {
    this.connection.createObject(new WlSubsurface(args.id, { parent: args.parent, surface: args.surface }));
  }
}
