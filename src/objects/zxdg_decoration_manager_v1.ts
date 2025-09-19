import { interfaces } from "@cathodique/wl-serv-low";
import { HLConnection } from "..";
import { BaseObject } from "./base_object";
import { XdgToplevel } from "./xdg_toplevel";
import { XdgSurface } from "./xdg_surface";

export class ZxdgDecorationManagerV1 extends BaseObject { }

export class ZxdgToplevelDecorationV1 extends BaseObject {
  xdgToplevel: XdgToplevel;
  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (!(args.toplevel instanceof XdgToplevel)) throw this.connection.display.raiseError('invalid_method', 'toplevel is not a toplevel');

    this.xdgToplevel = args.toplevel;
    if (this.xdgToplevel.decoration) throw this.raiseError('already_constructed');
    this.xdgToplevel.decoration = this;
  }

  sendToplevelDecoration(mode: 'client_side' | 'server_side') {
    this.addCommand('configure', {
      mode: interfaces.zxdg_toplevel_decoration_v1.enums.mode.atoi[mode],
    });
    (this.xdgToplevel.parent as XdgSurface).addCommand('configure', {
      serial: (this.xdgToplevel.parent as XdgSurface).newSerial(),
    });
    this.connection.sendPending();
  }
}
