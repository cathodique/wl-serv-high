import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { FromTo, XdgPositioner } from "./xdg_positioner.js";
import { StrutConfig } from "../registries/conceptRegistry/strut.js";
import { OutputConfiguration } from "../registries/_exports.js";

interface XdgPopupArgs {
  parent: XdgSurface;
  positioner: XdgPositioner;
}

function strutToFromTo(strut: StrutConfig): FromTo {
  return new FromTo({
    from: [strut.y, strut.x],
    to: [strut.y + strut.height, strut.x + strut.width],
  });
}

function outputToFromTo(output: OutputConfiguration): FromTo {
  return new FromTo({
    from: [output.y, output.x],
    to: [output.y + (output.h || output.effectiveH || 1080), output.x + (output.w || output.effectiveW || 1920)],
  });
}

export class XdgPopup extends BaseObject {
  appId?: string;

  meta: XdgPopupArgs;
  parent: XdgSurface;
  parentXdgSurface: XdgSurface;

  isGrabbed: boolean = false;
  grabSeat?: any;
  grabSerial?: number;

  geometry = { x: 0, y: 0, width: 0, height: 0 };

  constructor(initCtx: NewObjectDescriptor, args: XdgPopupArgs) {
    super(initCtx);

    this.meta = args;

    if (!(initCtx.parent instanceof XdgSurface)) throw new Error("Parent must be xdg_surface");
    this.parent = initCtx.parent;
    this.parent.popup = this;
    this.parent.role = "popup";
    this.parent.surface.setRole("popup");

    this.parentXdgSurface = args.parent;
    if (this.parentXdgSurface) {
      this.parentXdgSurface.daughterPopups.add(this);
      this.parentXdgSurface.emit("new_popup", this);
    }

    this.configureSequence();

    this.parent.surface.on("wlCommit", () => {
      this.emit("update");
    });
  }

  get renderReady(): boolean {
    return true;
  }

  computeFromTo(): FromTo {
    const positioner = this.meta.positioner;
    if (!positioner || !positioner.complete) {
      const size = positioner?.size ?? [200, 200];
      return new FromTo({ from: [0, 0], to: [size[0], size[1]] });
    }

    const original = positioner.unboundedPosition();
    const closest: [number, FromTo][] = [];

    const outputs = this.parentXdgSurface?.surface?.outputs?.size
      ? [...this.parentXdgSurface.surface.outputs]
      : (this.connection.display?.outputRegistry ? [...this.connection.display.outputRegistry.values()] : []);

    const struts = this.connection.display?.strutRegistry
      ? [...this.connection.display.strutRegistry].map(strutToFromTo)
      : [];

    for (const output of outputs) {
      const config = (output as any).config ?? output;
      if (!config) continue;
      const positionerFromTo = positioner.positionWithinOutputAndStruts(
        outputToFromTo(config),
        struts
      );
      if (positionerFromTo) {
        closest.push([original.centerDistance(positionerFromTo), positionerFromTo]);
      }
    }

    if (closest.length > 0) {
      closest.sort(([a], [b]) => a - b);
      return closest[0][1];
    }

    return original;
  }

  configureSequence(): void {
    const fromTo = this.computeFromTo();
    const { x, y, width, height } = fromTo.yxhw;
    this.geometry = { x, y, width, height };

    this.addCommand("configure", { x, y, width, height });
    this.parent.addCommand("configure", { serial: this.parent.newSerial() });
  }

  wlGrab(args: { seat: any; serial: number }): void {
    this.isGrabbed = true;
    this.grabSeat = args.seat;
    this.grabSerial = args.serial;
    this.emit("grab", args);
  }

  wlReposition(args: { positioner: XdgPositioner; token: number }): void {
    this.meta.positioner = args.positioner;
    const fromTo = this.computeFromTo();
    const { x, y, width, height } = fromTo.yxhw;
    this.geometry = { x, y, width, height };

    this.addCommand("repositioned", { token: args.token });
    this.addCommand("configure", { x, y, width, height });
    this.parent.addCommand("configure", { serial: this.parent.newSerial() });
  }

  popupDone(): void {
    this.addCommand("popupDone", {});
    this.emit("popup_done");
  }

  wlDestroy(): void {
    if (this.parentXdgSurface) {
      this.parentXdgSurface.daughterPopups.delete(this);
    }
    this.emit("destroy");
    super.wlDestroy();
  }
}
