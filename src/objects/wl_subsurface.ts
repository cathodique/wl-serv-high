import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";

interface WlSubsurfaceArgs {
  surface: WlSurface;
  parent: WlSurface;
}

type Relation = "parent" | "sibling" | "not_directly_related";
export class WlSubsurface extends BaseObject {
  meta: WlSubsurfaceArgs;

  isSynced: boolean;

  constructor(initCtx: NewObjectDescriptor, args: WlSubsurfaceArgs) {
    super(initCtx);

    this.isSynced = true;

    this.meta = args;
    this.meta.surface.subsurface = this;
    this.meta.parent.daughterSurfaces.add(args.surface);

    this.meta.surface.setRole("subsurface");
  }

  wlSetDesync() { this.isSynced = false }
  wlSetSync() { this.isSynced = true }

  getRelationWith(surf: WlSurface): Relation {
    if (this.meta.surface === surf) return "parent";
    if (this.meta.parent.daughterSurfaces.has(surf)) return "sibling";
    return "not_directly_related";
  }

  wlSetPosition(args: { y: number, x: number }) { console.log(args) }
}
