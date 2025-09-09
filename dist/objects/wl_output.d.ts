import { BaseObject } from "./base_object.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";
export declare class OutputAuthority extends ObjectAuthority<WlOutput, OutputConfiguration> {
}
export interface OutputConfiguration {
    x: number;
    y: number;
    w: number;
    h: number;
    effectiveW: number;
    effectiveH: number;
}
export declare class WlOutput extends BaseObject {
    info: OutputConfiguration;
    authority: OutputAuthority;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    advertise(): void;
}
