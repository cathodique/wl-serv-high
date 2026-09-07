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

    this.meta = args;
    this.meta.surface.subsurface = this;

    const parent = this.meta.parent;
    const surface = this.meta.surface;

    parent.daughterSurfaces.add(surface);
    if (!parent.subsurfaceOrder.includes(surface)) {
      parent.subsurfaceOrder.push(surface);
    }

    this.isSynced = true;
    surface.cont.convert("sync");
    parent.cont.children.add(surface.cont);

    surface.setRole("subsurface");
    parent.emit("new_subsurface", surface);
  }

  wlSetDesync() {
    this.isSynced = false;
    this.meta.surface.cont.convert("desync");
  }

  wlSetSync() {
    this.isSynced = true;
    this.meta.surface.cont.convert("sync");
  }

  getRelationWith(surf: WlSurface): Relation {
    if (this.meta.parent === surf) return "parent";
    if (this.meta.parent.daughterSurfaces.has(surf)) return "sibling";
    return "not_directly_related";
  }

  wlSetPosition(args: { x: number; y: number }) {
    const parent = this.meta.parent;
    const surface = this.meta.surface;
    parent.cont.appendAction(() => {
      surface.offset = [args.x, args.y];
    });
  }

  wlPlaceAbove(args: { sibling: WlSurface }) {
    const parent = this.meta.parent;
    const surface = this.meta.surface;
    const sibling = args.sibling;

    parent.cont.appendAction(() => {
      const order = parent.subsurfaceOrder;
      const curIdx = order.indexOf(surface);
      if (curIdx !== -1) order.splice(curIdx, 1);

      if (sibling === parent) {
        // Place just above the parent (at start of above-parent stack)
        order.unshift(surface);
      } else {
        const sibIdx = order.indexOf(sibling);
        if (sibIdx !== -1) {
          order.splice(sibIdx + 1, 0, surface);
        } else {
          order.push(surface);
        }
      }
      parent.emit("restack_subsurfaces");
    });
  }

  wlPlaceBelow(args: { sibling: WlSurface }) {
    const parent = this.meta.parent;
    const surface = this.meta.surface;
    const sibling = args.sibling;

    parent.cont.appendAction(() => {
      const order = parent.subsurfaceOrder;
      const curIdx = order.indexOf(surface);
      if (curIdx !== -1) order.splice(curIdx, 1);

      if (sibling === parent) {
        // Place below parent
        order.unshift(surface);
      } else {
        const sibIdx = order.indexOf(sibling);
        if (sibIdx !== -1) {
          order.splice(Math.max(0, sibIdx), 0, surface);
        } else {
          order.unshift(surface);
        }
      }
      parent.emit("restack_subsurfaces");
    });
  }

  wlDestroy() {
    const parent = this.meta.parent;
    const surface = this.meta.surface;

    parent.daughterSurfaces.delete(surface);
    const idx = parent.subsurfaceOrder.indexOf(surface);
    if (idx !== -1) parent.subsurfaceOrder.splice(idx, 1);

    parent.emit("remove_subsurface", surface);
    super.wlDestroy();
  }
}
