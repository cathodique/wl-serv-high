import { BaseObject } from "./base_object.js";
import { HLConnection } from "../index.js";
import { WlPointer } from "./wl_pointer.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";
import { WlSurface } from "./wl_surface.js";
export interface SeatConfiguration {
    name: string;
    capabilities: number;
}
export declare class SeatAuthority extends ObjectAuthority<WlSeat, SeatConfiguration> {
    modifiers(dep: number, latch: number, lock: number, group: number, serial?: number): void;
    focus(surf: WlSurface, keysDown: number[]): void;
    blur(surf: WlSurface): void;
    keyDown(keyDown: number, isRepeat?: boolean): void;
    keyUp(keyUp: number): void;
    enter(surf: WlSurface, surfX: number, surfY: number): number;
    moveTo(surfX: number, surfY: number): void;
    leave(surf: WlSurface): void;
    buttonDown(button: number): void;
    buttonUp(button: number): void;
}
export declare class WlSeat extends BaseObject {
    info: SeatConfiguration;
    authority: SeatAuthority;
    pointers: Set<WlPointer>;
    keyboards: Set<WlKeyboard>;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlGetPointer({ id: pointer }: {
        id: WlPointer;
    }): void;
    wlGetKeyboard({ id: keyboard }: {
        id: WlKeyboard;
    }): void;
    addCommandToPointers(eventName: string, args: Record<string, any>): void;
    addCommandToKeyboards(eventName: string, args: Record<string, any>): void;
}
