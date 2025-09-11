import { WlCallback } from "./wl_callback.js";
import { BaseObject } from "./base_object.js";
import { HLConnection } from "../index.js";
import { OutputAuthority, OutputConfiguration } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration } from "./wl_seat.js";
export declare class WlDisplay extends BaseObject {
    _version: number;
    outputAuthorities: Map<OutputConfiguration, OutputAuthority>;
    seatAuthorities: Map<SeatConfiguration, SeatAuthority>;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlSync(args: {
        callback: WlCallback;
    }): void;
    wlDestroy(): void;
}
