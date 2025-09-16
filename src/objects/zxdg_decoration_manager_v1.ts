import { HLConnection } from "..";
import { BaseObject } from "./base_object";
import { XdgToplevel } from "./xdg_toplevel";

export class ZxdgDecorationManagerV1 extends BaseObject { }

export class ZxdgToplevelDecorationV1 extends BaseObject {
  xdgToplevel: XdgToplevel;
  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (!(args.toplevel instanceof XdgToplevel)) throw this.connection.display.raiseError('invalid_method', 'toplevel is not a toplevel');

    this.xdgToplevel = args.toplevel;
  }
}
