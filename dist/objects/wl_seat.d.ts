import { BaseObject } from "./base_object.js";
import { HLConnection } from "../index.js";
import { WlPointer } from "./wl_pointer.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";
export interface SeatConfiguration {
    name: string;
    capabilities: number;
}
export declare class SeatAuthority extends ObjectAuthority<WlSeat, SeatConfiguration> {
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
