import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import type { ObjectReference } from "@cathodique/wl-serv-low";
import { WlSurface } from "./wl_surface.js";
export interface WlBufferMetadata {
}
export declare class WlBuffer extends BaseObject {
    offset: number;
    width: number;
    height: number;
    stride: number;
    format: number;
    surface?: WlSurface;
    buffer: Buffer;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    wlDestroy(): void;
    get pixelSize(): number;
    get size(): number;
    getBoundedRect(y: number, x: number, h: number, w: number): number[];
    getBufferArea(y: number, x: number, h: number, w: number): Buffer<ArrayBufferLike>;
    updateBufferArea(y: number, x: number, h: number, w: number): Buffer<ArrayBufferLike>;
}
