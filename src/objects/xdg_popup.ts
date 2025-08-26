import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";

export class XdgPopup extends BaseObject {
  appId?: string;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    if (!(parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    super(conx, args, ifaceName, oid, parent, version);

    parent.role = this;

    const config = this.registry!.outputRegistry.current;
    // if (!config) throw new Error('Could not fetch outputRegistry - Did you instantiate wl_output before wl_registry?');

    // TODO: Retrieve that automatically (from config or sth idk)
    this.addCommand('configure', { width: 200, height: 200, x: 0, y: 0 });
    parent.addCommand('configure', { serial: parent.newSerial() });
  }
  get renderReady() {
    // Check if the top-level has been set-up enough to be render-ready
    return true;
  }
}
