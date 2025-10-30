import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";

export class WlSubcompositor extends BaseObject {
  wlGetSubsurface(args: { id: NewObjectDescriptor, surface: WlSurface, parent: WlSurface }) {
    // TODO: git refactor-object-creation : Create object
  }
}
