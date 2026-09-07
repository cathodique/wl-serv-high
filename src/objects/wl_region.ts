import { BaseObject } from "./base_object.js";

export enum InstructionType {
  Add,
  Subtract,
}
export class RegRectangle {
  type: InstructionType;
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(type: InstructionType, x: number, y: number, w: number, h: number) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  hasCoordinate(x: number, y: number) {
    return this.x <= x && this.y <= y
      && this.w + this.x > x && this.h + this.y > y;
  }

  copyWithDelta(y: number, x: number) {
    return new RegRectangle(this.type, this.y + y, this.x + x, this.h, this.w);
  }
}

export class WlRegion extends BaseObject {
  instructions: RegRectangle[] = [];

  wlAdd(args: { y: number; x: number; height: number; width: number }) {
    this.instructions.push(new RegRectangle(InstructionType.Add, args.x, args.y, args.width, args.height));
  }

  wlSubtract(args: { y: number; x: number; height: number; width: number }) {
    this.instructions.push(new RegRectangle(InstructionType.Subtract, args.x, args.y, args.width, args.height));
  }
}
