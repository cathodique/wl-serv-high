import { HLConnection } from "../index.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgPopup } from "./xdg_popup.js";
import { XdgToplevel } from "./xdg_toplevel.js";

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class XdgSurface extends BaseObject {
  surface: WlSurface;
  role: XdgToplevel | XdgPopup | null = null;

  lastConfigureSerial = 0;
  // wasLastConfigureAcked = true;
  pendingSerials = new Set();

  // globalCoords =

  geometry: DoubleBuffer<WindowGeometry> = new DoubleBuffer({ x: 0, y: 0, width: 0, height: 0 }, this);

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.surface = args.surface;

    this.surface.doubleBufferedState.add(this.geometry);
  }

  wlDestroy(): void {
    super.wlDestroy();
    this.surface.doubleBufferedState.delete(this.geometry);
  }

  newSerial() {
    this.lastConfigureSerial += 1;
    this.pendingSerials.add(this.lastConfigureSerial);
    return this.lastConfigureSerial;
  }

  wlAckConfigure({ serial }: { serial: number }) {
    if (!this.pendingSerials.has(serial)) throw this.raiseError('invalid_method', 'Last configure was already acked, or idk wtf ur talking about');

    this.pendingSerials.delete(serial);
  }

  wlSetWindowGeometry(newGeom: { x: number, y: number, width: number, height: number }) {
    this.geometry.pending = newGeom;
  }
}
