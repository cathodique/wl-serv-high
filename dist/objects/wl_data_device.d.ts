import { BaseObject } from "./base_object.js";
import { WlSeat } from "./wl_seat.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
import { WlKeyboard } from "./wl_keyboard.js";
export declare class WlDataDevice extends BaseObject {
    seat: WlSeat;
    onDestroy: (() => void)[];
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    surfaceFocusCallback(kbd: WlKeyboard): void;
}
