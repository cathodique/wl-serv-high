"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
class Time {
    origin;
    constructor() { this.origin = Date.now(); }
    getTime() { return Date.now() - this.origin; }
}
exports.Time = Time;
