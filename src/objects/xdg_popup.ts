import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { FromTo, XdgPositioner } from "./xdg_positioner.js";

interface XdgPopupArgs {
  parent?: XdgSurface;
  positioner: XdgPositioner;
}

function fromToToYXHW (fromTo: FromTo) {
  const smallY = Math.min(fromTo.from[0], fromTo.to[0]);
  const bigY = Math.max(fromTo.from[0], fromTo.to[0]);
  const smallX = Math.min(fromTo.from[1], fromTo.to[1]);
  const bigX = Math.max(fromTo.from[1], fromTo.to[1]);

  return [smallY, smallX, bigY - smallY, bigX - smallX];
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

    // TODO: Fetch bounding box from parent
    const positionerFromTo = args.positioner.positionInBox([0, 0], [1024, 1024]);

    const [y, x, w, h] = fromToToYXHW(positionerFromTo);

    this.addCommand('configure', { width: w, height: h, x: x, y: y });
    this.parent.addCommand('configure', { serial: this.parent.newSerial() });
  }
  get renderReady() {
    return true;
  }
}
