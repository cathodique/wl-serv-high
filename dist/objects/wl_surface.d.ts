import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { XdgSurface } from "./xdg_surface.js";
import { HLConnection } from "../index.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { OutputConfiguration } from "./wl_output.js";
import { SeatConfiguration } from "./wl_seat.js";
interface KeyboardEvents extends Record<string, any[]> {
    keyDown: [SeatConfiguration, number];
    keyUp: [SeatConfiguration, number];
    modifier: [SeatConfiguration, number, number, number, number];
    focus: [SeatConfiguration, number[]];
    blur: [SeatConfiguration];
}
interface PointerEvents extends Record<string, any[]> {
    enter: [SeatConfiguration, number, number];
    moveTo: [SeatConfiguration, number, number];
    leave: [SeatConfiguration];
    buttonDown: [SeatConfiguration, number];
    buttonUp: [SeatConfiguration, number];
}
interface OutputEvents extends Record<string, any[]> {
    shown: [OutputConfiguration];
}
type SurfaceEvents = KeyboardEvents & PointerEvents & OutputEvents & {
    updateRole: [SurfaceRoles];
};
type SurfaceRoles = "cursor" | "toplevel" | "popup" | "subsurface";
export declare class WlSurface extends BaseObject<SurfaceEvents> {
    xdgSurface: XdgSurface | null;
    daughterSurfaces: Set<WlSurface>;
    subsurface: WlSubsurface | null;
    opaqueRegions: DoubleBuffer<RegRectangle[]>;
    inputRegions: DoubleBuffer<RegRectangle[]>;
    surfaceDamage: DoubleBuffer<RegRectangle[]>;
    bufferDamage: DoubleBuffer<RegRectangle[]>;
    buffer: DoubleBuffer<WlBuffer | null | undefined>;
    scale: DoubleBuffer<number>;
    offset: DoubleBuffer<[number, number]>;
    role?: SurfaceRoles;
    setRole(role: SurfaceRoles): void;
    doubleBufferedState: Set<DoubleBuffer<any>>;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    handleMouse(): void;
    output: OutputConfiguration | null;
    handleOutput(): void;
    handleKeyboard(): void;
    wlSetOpaqueRegion(args: {
        region: WlRegion;
    }): void;
    wlSetInputRegion(args: {
        region: WlRegion;
    }): void;
    wlOffset({ y, x }: {
        y: number;
        x: number;
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
    wlDamage({ y, x, height, width }: {
        y: number;
        x: number;
        height: number;
        width: number;
    }): void;
    wlDamageBuffer({ y, x, height, width }: {
        y: number;
        x: number;
        height: number;
        width: number;
    }): void;
    getCurrlyDammagedBuffer(): RegRectangle[];
}
export {};
