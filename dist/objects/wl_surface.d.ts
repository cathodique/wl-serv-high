import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { XdgSurface } from "./xdg_surface.js";
export declare class WlSurface extends BaseObject {
    xdgSurface: XdgSurface | null;
    daughterSurfaces: WlSurface[];
    subsurface: WlSubsurface | null;
    opaqueRegions: DoubleBuffer<RegRectangle[]>;
    inputRegions: DoubleBuffer<RegRectangle[]>;
    buffer: DoubleBuffer<WlBuffer | null>;
    scale: DoubleBuffer<number>;
    doubleBufferedState: Set<DoubleBuffer<any>>;
    surfaceToBufferDelta: [number, number];
    wlSetOpaqueRegion(args: {
        region: WlRegion;
    }): void;
    wlSetInputRegion(args: {
        region: WlRegion;
    }): void;
    wlFrame({ callback }: {
        callback: WlCallback;
    }): void;
    wlSetBufferScale(args: {
        scale: number;
    }): void;
    wlAttach(args: {
        buffer: WlBuffer | null;
    }): void;
    get synced(): boolean;
    update(): void;
    applyCache(): void;
    wlCommit(): void;
}
