import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";
export declare class WlSubsurface extends BaseObject {
    assocSurface: WlSurface;
    assocParent: WlSurface;
    isSynced: boolean;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlSetDesync(): void;
    wlSetSync(): void;
}
