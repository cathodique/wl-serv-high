import { HLConnection } from "../index.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgPopup } from "./xdg_popup.js";
import { XdgToplevel } from "./xdg_toplevel.js";

interface WindowGeometry {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

export class XdgSurface extends BaseObject {
  surface: WlSurface;
  role: XdgToplevel | XdgPopup | null = null;

  lastConfigureSerial = 0;
  wasLastConfigureAcked = true;

  geometry: DoubleBuffer<WindowGeometry> = new DoubleBuffer({ x: null, y: null, width: null, height: null });

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
    this.wasLastConfigureAcked = false;
    return this.lastConfigureSerial;
  }

  wlAckConfigure({ serial }: { serial: number }) {
    if (serial !== this.lastConfigureSerial) throw new Error('Serials do not match');
    if (this.wasLastConfigureAcked) throw new Error('Last configure was already acked');

    this.wasLastConfigureAcked = true;
  }

  wlSetWindowGeometry(newGeom: { x: number, y: number, width: number, height: number }) {
    this.geometry.pending = newGeom;
  }
}
