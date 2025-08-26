"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleBuffer = void 0;
class DoubleBuffer {
    current;
    cached;
    pending;
    constructor(v) {
        this.current = v;
        this.cached = v;
        this.pending = v;
    }
}
exports.DoubleBuffer = DoubleBuffer;
