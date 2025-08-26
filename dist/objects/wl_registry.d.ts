import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { OutputRegistry } from "./wl_output.js";
import { SeatRegistry } from "./wl_seat.js";
export interface WlRegistryMetadata {
    outputs: OutputRegistry;
    seats: SeatRegistry;
}
export declare class WlRegistry extends BaseObject {
    get registry(): this;
    static baseRegistry: (string | null)[];
    static supportedByRegistry: (string | null)[];
    contents: (string | null)[];
    outputRegistry: OutputRegistry;
    seatRegistry: SeatRegistry;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlBind(): void;
    wlGetRegistry(): void;
}
