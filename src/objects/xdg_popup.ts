import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { XdgPositioner } from "./xdg_positioner.js";

interface XdgPopupArgs {
  parent?: XdgSurface;
  positioner: XdgPositioner;
}

export class XdgPopup extends BaseObject {
  appId?: string;

  meta: XdgPopupArgs;

  constructor(initCtx: NewObjectDescriptor, args: XdgPopupArgs) {
    super(initCtx);

    this.meta = args;

    if (!(this.parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    this.parent.popup = this;
    this.parent.role = "popup";
    this.parent.surface.setRole("popup");

    // TODO: Retrieve that automatically (from positioner or sth idk)
    this.addCommand('configure', { width: 600, height: 600, x: 0, y: 0 });
    this.parent.addCommand('configure', { serial: this.parent.newSerial() });
  }
  get renderReady() {
    return true;
  }
}
