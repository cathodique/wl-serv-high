import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { HLConnection } from "../index.js";
export declare class WlShmPool extends BaseObject {
    size: number;
    fd: number;
    daughterBuffers: Set<WlBuffer>;
    bufferId: number;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlResize(args: Record<string, any>): void;
}
