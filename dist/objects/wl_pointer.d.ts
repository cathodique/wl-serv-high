import { ObjectReference } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";
export declare class WlPointer extends BaseObject {
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    wlSetCursor({ surface }: {
        surface: WlSurface;
    }): void;
}
