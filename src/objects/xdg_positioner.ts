import { interfaces } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { bitfieldValueToObject } from "../lib/bitfield.js";

const directionsAndCorners = ["top", "bottom", "left", "right", "top_left", "bottom_left", "top_right", "bottom_right"] as const;
const dirsAndCornsAndNone = [...directionsAndCorners, "none"] as const;

const optimizedFlip = {
  "none": "none",
  "top": "bottom",
  "bottom": "top",
  "left": "right",
  "right": "left",
  "top_left": "bottom_right",
  "bottom_left": "top_right",
  "top_right": "bottom_left",
  "bottom_right": "top_left",
} as const;

type ConstraintAdjustments = "flip_x" | "flip_y" | "slide_x" | "slide_y" | "resize_x" | "resize_y";

const cstrAdjEnum = interfaces["xdg_positioner"].enums.constraintAdjustment;
const caMap = new Map(Object.entries(cstrAdjEnum.itoa as Record<string, ConstraintAdjustments>).map(([k, v]) => [+k, v]));

// I actually forgot why I made this interface.
interface FromTo {
  from: [number, number];
  to: [number, number];
}

export class XdgPositioner extends BaseObject {
  size?: [number, number]; // YX
  wlSetSize({ height, width }: { height: number, width: number }) {
    if (height <= 0) return

    this.size = [height, width];
  }

  anchorPos?: [number, number]; // YX
  anchorSize?: [number, number]; // YX
  wlSetAnchorRect({ y, x, height, width }: { y: number, x: number, height: number, width: number }) {
    this.anchorPos = [y, x];
    this.anchorSize = [height, width];
  }

  anchor?: typeof dirsAndCornsAndNone[number];
  wlSetAnchor({ anchor }: { anchor: number }) {
    const fullAnchor = interfaces['xdg_positioner'].enums.anchor.itoa[anchor];

    this.anchor = fullAnchor as typeof dirsAndCornsAndNone[number]; // I dont think theyre gonna change it lol
  }

  gravity?: typeof dirsAndCornsAndNone[number];
  wlSetGravity({ anchor }: { anchor: number }) {
    const fullGravity = interfaces['xdg_positioner'].enums.gravity.itoa[anchor];

    this.gravity = fullGravity as typeof dirsAndCornsAndNone[number]; // I dont think theyre gonna change it lol
  }

  reactive = false;
  wlSetReactive() {
    this.reactive = true;
  }

  offset: [number, number] = [0, 0]; // YX also OH COME ON.
  wlSetOffset({ y, x }: { y: number, x: number }) {
    this.offset = [y, x];
  }

  constraintAdjustment?: Set<ConstraintAdjustments>;
  wlSetConstraintAdjustment({ constraintAdjustment }: { constraintAdjustment: number }) {
    this.constraintAdjustment = bitfieldValueToObject(caMap, constraintAdjustment);
  }

  private static isComplete(that: XdgPositioner): that is XdgPositioner & { size: [number, number], anchorPos: [number, number], anchorSize: [number, number] } {
    if (!(that.size?.every((v) => v > 0))) return false;
    if (!(that.anchorSize?.every((v) => v >= 0))) return false;

    return true;
  }

  anchorPoint(theoryAnchor?: typeof dirsAndCornsAndNone[number]): [number, number] {
    if (!XdgPositioner.isComplete(this)) throw new Error("Indeterminate.");

    let anchor: [number, number] = [this.offset[0] + this.anchorPos[0], this.offset[1] + this.anchorPos[1]];

    switch (theoryAnchor || this.anchor) {
      case "top_left":
      case "left":
      case "bottom_left":
        // X is null-W
        anchor[1] += 0;
        break;
      case "top":
      case "none":
      case "bottom":
        // X is half-W
        anchor[1] += this.anchorSize[1] / 2;
        break;
      case "top_right":
      case "right":
      case "bottom_right":
        // X is full-W
        anchor[1] += this.anchorSize[1];
        break;
    }
    switch (this.anchor) {
      case "top_left":
      case "top":
      case "top_right":
        // Y is null-H
        anchor[0] += 0;
        break;
      case "left":
      case "none":
      case "right":
        // Y is half-H
        anchor[0] += this.anchorSize[0] / 2;
        break;
      case "bottom_left":
      case "bottom":
      case "bottom_right":
        // Y is full-H
        anchor[0] += this.anchorSize[0];
        break;
    }

    return anchor;
  }

  unboundedPosition(theoryAnchor?: typeof dirsAndCornsAndNone[number], theoryGravity?: typeof dirsAndCornsAndNone[number]) {
    if (!XdgPositioner.isComplete(this)) throw new Error("Indeterminate.");

    const anchor = this.anchorPoint(theoryAnchor);
    const from: [number, number] = [...anchor];
    const to: [number, number] = [...anchor];

    switch (theoryGravity || this.gravity) {
      case "top_left":
      case "left":
      case "bottom_left":
        // +-----o
        from[1] -= this.size[1];
        break;
      case "top":
      case "none":
      case "bottom":
        // +--o--+
        from[1] -= this.size[0] / 2;
        to[1] += this.size[0] / 2;
        break;
      case "top_right":
      case "bottom_right":
        // o-----+
        to[1] += this.size[0] / 2;
        break;
    }
    switch (theoryGravity || this.gravity) {
      case "top_left":
      case "top":
      case "top_right":
        from[0] -= this.size[0];
        break;
      case "left":
      case "none":
      case "right":
        from[0] -= this.size[0] / 2;
        to[0] += this.size[0] / 2;
        break;
      case "bottom_left":
      case "bottom":
      case "bottom_right":
        to[0] -= this.size[0];
        break;
    }

    return { from, to };
  }

  positionInBox([contY, contX]: [number, number], [contH, contW]: [number, number]) {
    if (!XdgPositioner.isComplete(this)) throw new Error("Indeterminate.");

    // let [h, w] = this.size;
    let result: FromTo = this.unboundedPosition();

    if (!this.constraintAdjustment) return result;

    let isTopConstrained = result.from[0] < contY;
    let isBottomConstrained = result.to[0] > contH + contY;
    let isLeftConstrained = result.from[1] < contX;
    let isRightConstrained = result.to[1] > contW + contX;

    if (this.constraintAdjustment.has('flip_y') && (isBottomConstrained || isTopConstrained)) {
      let maybeResult = this.unboundedPosition(optimizedFlip[this.anchor || 'none'], optimizedFlip[this.gravity || 'none']);

      let isMaybeYConstrained = maybeResult.from[0] < contY || maybeResult.to[0] > contH + contY;
      if (!isMaybeYConstrained) {
        isBottomConstrained = false;
        isTopConstrained = false;
        result.from[0] = maybeResult.from[0];
        result.to[0] = maybeResult.to[0];
      }
    }

    if (this.constraintAdjustment.has('flip_x') && (isLeftConstrained || isRightConstrained)) {
      let maybeResult = this.unboundedPosition(optimizedFlip[this.anchor || 'none'], optimizedFlip[this.gravity || 'none']);

      let isMaybeXConstrained = maybeResult.from[1] < contX || maybeResult.to[1] > contW + contX;
      if (!isMaybeXConstrained) {
        isLeftConstrained = false;
        isRightConstrained = false;
        result.from[1] = maybeResult.from[1];
        result.to[1] = maybeResult.to[1];
      }
    }

    if (this.constraintAdjustment.has('slide_y') && (isBottomConstrained !== isTopConstrained)) {
      if (isTopConstrained) {
        const delta = contY - result.from[0];

        const newTo = result.to[0] + delta;

        if (newTo <= contY + contW) {
          isTopConstrained = false;
          result.from[0] = result.from[0] + delta;
          result.to[0] = newTo;
        }
      } else {
        const delta = result.to[0] - (contY + contH);

        const newFrom = result.from[0] - delta;

        if (newFrom >= contY) {
          isBottomConstrained = false;
          result.from[0] = newFrom;
          result.to[0] = result.to[0] - delta;
        }
      }
      // const newRange = [];
    }

    if (this.constraintAdjustment.has('slide_x') && (isLeftConstrained !== isRightConstrained )) {
      if (isTopConstrained) {
        const delta = contX - result.from[0];

        const newTo = result.to[0] + delta;

        if (newTo <= contX + contW) {
          isLeftConstrained = false;
          result.from[0] = result.from[0] + delta;
          result.to[0] = newTo;
        }
      } else {
        const delta = result.to[1] - (contX + contW);

        const newFrom = result.from[1] - delta;

        if (newFrom >= contX) {
          isRightConstrained = false;
          result.from[1] = newFrom;
          result.to[1] = result.to[1] - delta;
        }
      }
    }

    if (this.constraintAdjustment.has('resize_y') && (isBottomConstrained || isTopConstrained)) {
      if (result.from[0] < contY) {
        result.from[0] = contY;
        isTopConstrained = false;
      }
      if (result.to[0] > contY + contH) {
        result.to[0] = contY + contH;
        isTopConstrained = false;
      }
    }

    if (this.constraintAdjustment.has('resize_x') && (isLeftConstrained || isRightConstrained)) {
      if (result.from[1] < contX) {
        result.from[1] = contX;
        isLeftConstrained = false;
      }
      if (result.to[1] > contX + contW) {
        result.to[1] = contX + contW;
        isRightConstrained = false;
      }
    }

    return result;
  }

  // "The compositor may use this information together with set_parent_size to determine what future state the popup should be constrained using."
  // Nah, im good.

  get complete() {
    return XdgPositioner.isComplete(this);
  }
}
