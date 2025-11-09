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
// Re: No you didn't
export interface FromTo {
  from: [number, number];
  to: [number, number];
}

// AI-gen
export interface Rect {
  x: number;      // Horizontal position (left)
  y: number;      // Vertical position (top)
  width: number;  // Width of the rectangle
  height: number; // Height of the rectangle
}

type CompleteXdgPositioner = XdgPositioner & { size: [number, number], anchorPos: [number, number], anchorSize: [number, number] };

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

  constraintAdjustment: Set<ConstraintAdjustments> = new Set();
  wlSetConstraintAdjustment({ constraintAdjustment }: { constraintAdjustment: number }) {
    this.constraintAdjustment = bitfieldValueToObject(caMap, constraintAdjustment);
  }

  private static isComplete(that: XdgPositioner): that is CompleteXdgPositioner {
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

  // Begin AI-generated code.
  // What this means is that I'm getting impatient and want to move on to something else than
  // dealing with areas and theoretical stuff.
  // Sorry to disappoint :')
  // (spent a good amount of time to try to guide it properly too, hopefully that works as it should)
  // ((TODO: Make a test suite))
  private cloneFromTo(r: FromTo): FromTo {
    return { from: [r.from[0], r.from[1]], to: [r.to[0], r.to[1]] };
  }

  private rectWidth(r: FromTo): number {
    return r.to[1] - r.from[1];
  }

  private rectHeight(r: FromTo): number {
    return r.to[0] - r.from[0];
  }

  private rectContains(a: FromTo, b: FromTo): boolean {
    return b.from[0] >= a.from[0] && b.to[0] <= a.to[0] && b.from[1] >= a.from[1] && b.to[1] <= a.to[1];
  }

  private rectIntersect(a: FromTo, b: FromTo): FromTo | null {
    const top = Math.max(a.from[0], b.from[0]);
    const left = Math.max(a.from[1], b.from[1]);
    const bottom = Math.min(a.to[0], b.to[0]);
    const right = Math.min(a.to[1], b.to[1]);
    if (bottom <= top || right <= left) return null;
    return { from: [top, left], to: [bottom, right] };
  }

  private rectSubtract(rect: FromTo, sub: FromTo): FromTo[] {
    const inter = this.rectIntersect(rect, sub);
    if (!inter) return [this.cloneFromTo(rect)];

    const [top, left, bottom, right] = [rect.from[0], rect.from[1], rect.to[0], rect.to[1]];
    const [sTop, sLeft, sBottom, sRight] = [sub.from[0], sub.from[1], sub.to[0], sub.to[1]];
    const out: FromTo[] = [];

    if (sTop > top) out.push({ from: [top, left], to: [Math.min(sTop, bottom), right] });
    if (sBottom < bottom) out.push({ from: [Math.max(sBottom, top), left], to: [bottom, right] });

    const midTop = Math.max(top, sTop);
    const midBottom = Math.min(bottom, sBottom);
    if (sLeft > left && midBottom > midTop)
      out.push({ from: [midTop, left], to: [midBottom, Math.min(sLeft, right)] });
    if (sRight < right && midBottom > midTop)
      out.push({ from: [midTop, Math.max(sRight, left)], to: [midBottom, right] });

    return out;
  }

  computeAllowedRects(outputBounds: FromTo, struts: FromTo[]): FromTo[] {
    let allowed: FromTo[] = [this.cloneFromTo(outputBounds)];
    for (const s of struts) {
      const next: FromTo[] = [];
      for (const a of allowed) {
        const pieces = this.rectSubtract(a, s);
        for (const p of pieces)
          if (this.rectWidth(p) > 0 && this.rectHeight(p) > 0) next.push(p);
      }
      allowed = next;
      if (allowed.length === 0) break;
    }
    return allowed;
  }

  private fitsInAnyAllowed(rect: FromTo, allowed: FromTo[]): boolean {
    return allowed.some(a => this.rectContains(a, rect));
  }

  private flipAnchorName(
    anchor: typeof dirsAndCornsAndNone[number] | undefined,
    flipX: boolean,
    flipY: boolean
  ): typeof dirsAndCornsAndNone[number] | undefined {
    if (!anchor) return undefined;
    const parts = anchor === "none" ? ["none"] : anchor.split("_");
    let vert: string | null = null;
    let horiz: string | null = null;

    for (const p of parts) {
      if (p === "top" || p === "bottom") vert = p;
      if (p === "left" || p === "right") horiz = p;
    }

    if (flipY) vert = vert === "top" ? "bottom" : vert === "bottom" ? "top" : vert;
    if (flipX) horiz = horiz === "left" ? "right" : horiz === "right" ? "left" : horiz;

    if (vert && horiz) return (vert + "_" + horiz) as typeof dirsAndCornsAndNone[number];
    if (vert) return vert as typeof dirsAndCornsAndNone[number];
    if (horiz) return horiz as typeof dirsAndCornsAndNone[number];
    return "none";
  }

  tryFlips(outputAllowed: FromTo[]): FromTo | null {
    const flipXAllowed = this.constraintAdjustment.has("flip_x");
    const flipYAllowed = this.constraintAdjustment.has("flip_y");
    const combos: Array<[boolean, boolean]> = [];

    if (flipXAllowed) combos.push([true, false]);
    if (flipYAllowed) combos.push([false, true]);
    if (flipXAllowed && flipYAllowed) combos.push([true, true]);

    for (const [fx, fy] of combos) {
      const anchorName = this.flipAnchorName(this.anchor, fx, fy);
      const gravityName = this.flipAnchorName(this.gravity, fx, fy);
      const candidate = this.unboundedPosition(anchorName, gravityName);
      if (this.fitsInAnyAllowed(candidate, outputAllowed)) return candidate;
    }

    return null;
  }

  private slideAlongAxis(original: FromTo, axis: "x" | "y", allowed: FromTo[]): FromTo | null {
    const size = axis === "x" ? this.rectWidth(original) : this.rectHeight(original);
    const origCenter = axis === "x"
      ? (original.from[1] + original.to[1]) / 2
      : (original.from[0] + original.to[0]) / 2;

    const positions: number[] = [];
    for (const a of allowed) {
      const min = axis === "x" ? a.from[1] : a.from[0];
      const max = axis === "x" ? a.to[1] - size : a.to[0] - size;
      if (min <= max) {
        positions.push(min, max);
        const origPos = axis === "x" ? original.from[1] : original.from[0];
        positions.push(Math.min(Math.max(origPos, min), max));
      }
    }

    positions.sort((a, b) => Math.abs(a - origCenter) - Math.abs(b - origCenter));
    for (const pos of new Set(positions)) {
      const shifted = this.cloneFromTo(original);
      if (axis === "x") {
        shifted.from[1] = pos;
        shifted.to[1] = pos + size;
      } else {
        shifted.from[0] = pos;
        shifted.to[0] = pos + size;
      }
      if (this.fitsInAnyAllowed(shifted, allowed)) return shifted;
    }

    return null;
  }

  trySlide(outputAllowed: FromTo[]): FromTo | null {
    const original = this.unboundedPosition();
    const slideX = this.constraintAdjustment.has("slide_x");
    const slideY = this.constraintAdjustment.has("slide_y");
    if (!slideX && !slideY) return null;

    let xResult: FromTo | null = original;
    let yResult: FromTo | null = original;

    if (slideX) xResult = this.slideAlongAxis(original, "x", outputAllowed);
    if (slideY) yResult = this.slideAlongAxis(original, "y", outputAllowed);

    if (slideX && slideY) {
      if (xResult && yResult) {
        const combined = this.cloneFromTo(original);
        combined.from[1] = xResult.from[1];
        combined.to[1] = xResult.to[1];
        combined.from[0] = yResult.from[0];
        combined.to[0] = yResult.to[0];
        if (this.fitsInAnyAllowed(combined, outputAllowed)) return combined;
        if (this.fitsInAnyAllowed(xResult, outputAllowed)) return xResult;
        if (this.fitsInAnyAllowed(yResult, outputAllowed)) return yResult;
      }
      return null;
    }

    return slideX ? xResult : yResult;
  }

  tryResize(outputAllowed: FromTo[]): FromTo | null {
    const original = this.unboundedPosition();
    const resizeX = this.constraintAdjustment.has("resize_x");
    const resizeY = this.constraintAdjustment.has("resize_y");
    if (!resizeX && !resizeY) return null;

    const resized = this.cloneFromTo(original);
    let changed = false;

    if (resizeX) {
      const best = outputAllowed.reduce(
        (a, b) => (this.rectWidth(b) > this.rectWidth(a) ? b : a),
        outputAllowed[0]
      );
      const curW = this.rectWidth(resized);
      const maxW = this.rectWidth(best);
      if (curW > maxW) {
        const cx = (resized.from[1] + resized.to[1]) / 2;
        const left = Math.max(best.from[1], Math.min(cx - maxW / 2, best.to[1] - maxW));
        resized.from[1] = left;
        resized.to[1] = left + maxW;
        changed = true;
      }
    }

    if (resizeY) {
      const best = outputAllowed.reduce(
        (a, b) => (this.rectHeight(b) > this.rectHeight(a) ? b : a),
        outputAllowed[0]
      );
      const curH = this.rectHeight(resized);
      const maxH = this.rectHeight(best);
      if (curH > maxH) {
        const cy = (resized.from[0] + resized.to[0]) / 2;
        const top = Math.max(best.from[0], Math.min(cy - maxH / 2, best.to[0] - maxH));
        resized.from[0] = top;
        resized.to[0] = top + maxH;
        changed = true;
      }
    }

    return changed && this.fitsInAnyAllowed(resized, outputAllowed) ? resized : null;
  }

  positionWithinOutputAndStruts(outputBounds: FromTo, struts: FromTo[]): FromTo | null {
    if (!XdgPositioner.isComplete(this)) throw new Error("Indeterminate.");
    const allowed = this.computeAllowedRects(outputBounds, struts);
    if (allowed.length === 0) return null;

    const original = this.unboundedPosition();
    if (this.fitsInAnyAllowed(original, allowed)) return original;

    const flip = this.tryFlips(allowed);
    if (flip) return flip;

    const slide = this.trySlide(allowed);
    if (slide) return slide;

    const resize = this.tryResize(allowed);
    if (resize) return resize;

    return null;
  }
  // End AI-generated code.

  // "The compositor may use this information together with set_parent_size to determine what future state the popup should be constrained using."
  // Nah, im good.

  get complete() {
    return XdgPositioner.isComplete(this);
  }
}
