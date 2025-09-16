import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";

export class XdgPopup extends BaseObject {
  appId?: string;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    if (!(parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    super(conx, args, ifaceName, oid, parent, version);

    parent.role = this;
    parent.surface.setRole("popup");

    // TODO: Retrieve that automatically (from positioner or sth idk)
    this.addCommand('configure', { width: 600, height: 600, x: 0, y: 0 });
    parent.addCommand('configure', { serial: parent.newSerial() });
  }
  get renderReady() {
    return true;
  }
}
