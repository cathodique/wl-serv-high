import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object";
import { XdgToplevel } from "./xdg_toplevel";
import { XdgSurface } from "./xdg_surface";

export class ZxdgDecorationManagerV1 extends BaseObject {
  wlGetToplevelDecoration(args: { id: NewObjectDescriptor, toplevel: XdgToplevel }) {
    this.connection.createObject(new ZxdgToplevelDecorationV1(args.id, args.toplevel));
  }
}

export class ZxdgToplevelDecorationV1 extends BaseObject {
  xdgToplevel: XdgToplevel;

  constructor(initCtx: NewObjectDescriptor, toplevel: XdgToplevel) {
    super(initCtx);

    // TODO: Is this check necessary? Why is this check not systematic?
    if (!(toplevel instanceof XdgToplevel)) throw this.connection.display.raiseError('invalid_method', 'toplevel is not a toplevel');

    this.xdgToplevel = toplevel;
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
