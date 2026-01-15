import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { FromTo, XdgPositioner } from "./xdg_positioner.js";
import { StrutConfig } from "../registries/conceptRegistry/strut.js";
import { OutputConfiguration } from "../registries/_exports.js";

interface XdgPopupArgs {
  parent: XdgSurface; // We will see when we will implement a protocol that might require it to be null
  positioner: XdgPositioner;
}

function strutToFromTo (strut: StrutConfig) {
  const result = new FromTo({
    from: [strut.y, strut.x],
    to: [strut.y + strut.height, strut.x + strut.width],
  });

  return result;
}

function outputToFromTo (output: OutputConfiguration) {
  const result = new FromTo({
    from: [output.y, output.x],
    to: [output.y + output.h, output.x + output.w],
  });

  return result;
}

export class XdgPopup extends BaseObject {
  appId?: string;

  meta: XdgPopupArgs;
  parent: XdgSurface;

  constructor(initCtx: NewObjectDescriptor, args: XdgPopupArgs) {
    super(initCtx);

    this.meta = args;

    if (!(initCtx.parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    this.parent = initCtx.parent;
    this.parent.popup = this;
    this.parent.role = "popup";
    this.parent.surface.setRole("popup");
  }
  get renderReady() {
    return true;
  }

  render() {
    const fromTo = this.#computeFromTo();

    this.addCommand('configure', fromTo.yxhw);
    this.parent.addCommand('configure', { serial: this.parent.newSerial() });
  }

  #computeFromTo() {
    const positioner = this.meta.positioner;

    const original = positioner.unboundedPosition();
    const closest: [number, FromTo][] = [];
    // TODO: Fetch bounding box from parent
    for (const output of this.meta.parent.surface.outputs) {
      const positionerFromTo = positioner.positionWithinOutputAndStruts(
        outputToFromTo(output.config),
        [...this.connection.display.strutRegistry.configSet].map(strutToFromTo),
      )!;

      closest.push([original.centerDistance(positionerFromTo), positionerFromTo]);
    }

    closest.sort(([a, ], [b, ]) => a - b);

    return closest[0][1];
  }
}
