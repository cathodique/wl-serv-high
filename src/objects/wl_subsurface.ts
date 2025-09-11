import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";

type Relation = "parent" | "sibling" | "not_directly_related";
export class WlSubsurface extends BaseObject {
  assocSurface: WlSurface;
  assocParent: WlSurface;
  isSynced: boolean;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.assocSurface = args.surface;
    this.assocSurface.subsurface = this;
    this.isSynced = true;
    this.assocParent = args.parent;
    args.parent.daughterSurfaces.add(args.surface);

    this.assocSurface.setRole("subsurface");
  }

  wlSetDesync() { this.isSynced = false }
  wlSetSync() { this.isSynced = true }

  getRelationWith(surf: WlSurface): Relation {
    if (this.assocSurface === surf) return "parent";
    if (this.assocParent.daughterSurfaces.has(surf)) return "sibling";
    return "not_directly_related";
  }

  wlSetPosition(args: { y: number, x: number }) { console.log(args) }
}
