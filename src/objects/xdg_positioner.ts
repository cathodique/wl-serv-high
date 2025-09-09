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
};

type ConstraintAdjustments = "flip_x" | "flip_y" | "slide_x" | "slide_y" | "scale_x" | "scale_y";

const cstrAdjEnum = interfaces["xdg_positioner"].enums.constraintAdjustment;
const caMap = new Map(Object.entries(cstrAdjEnum.itoa as Record<string, ConstraintAdjustments>).map(([k, v]) => [+k, v]));

interface FromTo {
  from: [number, number];
  to: [number, number];
}

const name = 'xdg_positioner' as const;
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
      case "bottom_left":
        // X is null-W
        anchor[1] += 0;
        break;
      case "top":
      case "bottom":
        // X is half-W
        anchor[1] += this.anchorSize[1] / 2;
        break;
      case "top_right":
      case "bottom_right":
        // X is full-W
        anchor[1] += this.anchorSize[1];
        break;
    }
    switch (this.anchor) {
      case "top_left":
      case "top_right":
        // Y is null-H
        anchor[0] += 0;
        break;
      case "left":
      case "right":
        // Y is half-H
        anchor[0] += this.anchorSize[0] / 2;
        break;
      case "bottom_left":
      case "bottom_right":
        // Y is full-H
        anchor[0] += this.anchorSize[0];
        break;
    }

    return anchor;
  }

  // unboundedPosition(theoryAnchor?: typeof dirsAndCornsAndNone[number], theoryGravity?: typeof dirsAndCornsAndNone[number]) {
  //   const from = this.anchorPoint(theoryAnchor);

  //   switch (theoryGravity || this.gravity) {
  //     case ""
  //   }
  // }

  positionInBox([y, x]: [number, number], [contH, contW]: [number, number]) {
    if (!XdgPositioner.isComplete(this)) throw new Error("Indeterminate.");

    let [h, w] = this.size;
    const anchorPoint = this.anchorPoint();


  }

  // "The compositor may use this information together with set_parent_size to determine what future state the popup should be constrained using."
  // Nah, im good.

  get complete() {
    return XdgPositioner.isComplete(this);
  }
}
