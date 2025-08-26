import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import type { ObjectReference } from "@cathodique/wl-serv-low";
export interface WlBufferMetadata {
}
export declare class WlBuffer extends BaseObject {
    offset: number;
    width: number;
    height: number;
    stride: number;
    format: number;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    wlRelease(): void;
    get pixelSize(): number;
    get size(): number;
    getBuffer(): Buffer<ArrayBufferLike>;
    getByte(i: number): number;
}
