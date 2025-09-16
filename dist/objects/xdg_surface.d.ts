import { HLConnection } from "../index.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { BaseObject } from "./base_object.js";
import { WlSurface } from "./wl_surface.js";
import { XdgPopup } from "./xdg_popup.js";
import { XdgToplevel } from "./xdg_toplevel.js";
export interface WindowGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class XdgSurface extends BaseObject {
    surface: WlSurface;
    role: XdgToplevel | XdgPopup | null;
    lastConfigureSerial: number;
    wasLastConfigureAcked: boolean;
    geometry: DoubleBuffer<WindowGeometry>;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlDestroy(): void;
    newSerial(): number;
    wlAckConfigure({ serial }: {
        serial: number;
    }): void;
    wlSetWindowGeometry(newGeom: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
}
