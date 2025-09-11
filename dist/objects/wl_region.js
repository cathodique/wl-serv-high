"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlRegion = exports.RegRectangle = exports.InstructionType = void 0;
const base_object_js_1 = require("./base_object.js");
var InstructionType;
(function (InstructionType) {
    InstructionType[InstructionType["Add"] = 0] = "Add";
    InstructionType[InstructionType["Subtract"] = 1] = "Subtract";
})(InstructionType || (exports.InstructionType = InstructionType = {}));
class RegRectangle {
    type;
    x;
    y;
    w;
    h;
    constructor(type, y, x, h, w) {
        this.type = type;
        this.y = y;
        this.x = x;
        this.h = h;
        this.w = w;
    }
    hasCoordinate(y, x) {
        return this.x <= x && this.y <= y
            && this.w + this.x > x && this.h + this.y > y;
    }
    copyWithDelta(y, x) {
        return new RegRectangle(this.type, this.y + y, this.x + x, this.h, this.w);
    }
}
exports.RegRectangle = RegRectangle;
class WlRegion extends base_object_js_1.BaseObject {
    instructions = [];
    wlAdd(args) {
        this.instructions.push(new RegRectangle(InstructionType.Add, args.y, args.x, args.h, args.w));
    }
    wlSubtract(args) {
        this.instructions.push(new RegRectangle(InstructionType.Subtract, args.y, args.x, args.h, args.w));
    }
}
exports.WlRegion = WlRegion;
