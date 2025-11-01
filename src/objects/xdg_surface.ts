import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgPopup } from "./xdg_popup.js";
import { XdgToplevel } from "./xdg_toplevel.js";
import { XdgPositioner } from "./xdg_positioner.js";

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class XdgSurface extends BaseObject {
  surface: WlSurface;
  toplevel?: XdgToplevel;
  popup?: XdgPopup;

  _role?: "toplevel" | "popup";
  _roleActive: boolean = false;
  get role() {
    return this._roleActive ? this._role : undefined;
  }
  set role(newRole) {
    if (newRole == undefined) {
      this._roleActive = false;
      return;
    }

    if (this._role && newRole !== this._role) throw new Error("Role is different than previously assigned role");

    this._roleActive = true;
    this._role = newRole;
  }

  lastConfigureSerial = 0;
  // wasLastConfigureAcked = true;
  pendingSerials = new Set();

  // globalCoords =

  geometry: DoubleBuffer<WindowGeometry> = new DoubleBuffer({ x: 0, y: 0, width: 0, height: 0 }, this);

  constructor(initCtx: NewObjectDescriptor, surface: WlSurface) {
    super(initCtx);

    this.surface = surface;

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

  wlGetToplevel(args: { id: NewObjectDescriptor }) {
    this.role = "toplevel";

    this.toplevel = new XdgToplevel(args.id);
    this.connection.createObject(this.toplevel);
  }

  wlGetPopup(args: { id: NewObjectDescriptor, parent: XdgSurface, positioner: XdgPositioner }) {
    this.role = "popup";

    // TODO: git refactor-object-creation : Create object
    this.popup = new XdgPopup(args.id, { parent: args.parent, positioner: args.positioner });
    this.connection.createObject(this.popup);
  }
}
