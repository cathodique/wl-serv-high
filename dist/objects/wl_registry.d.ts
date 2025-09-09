import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { OutputAuthority, OutputConfiguration } from "./wl_output.js";
import { SeatAuthority, SeatConfiguration } from "./wl_seat.js";
export interface WlRegistryMetadata {
    outputs: OutputConfiguration[];
    seats: SeatConfiguration[];
}
export declare class WlRegistry extends BaseObject {
    get registry(): this;
    static baseRegistry: (string | null)[];
    static supportedByRegistry: (string | null)[];
    contents: (string | null)[];
    outputAuthorities: Map<number, OutputAuthority>;
    outputAuthoritiesByConfig: Map<OutputConfiguration, OutputAuthority>;
    seatAuthorities: Map<number, SeatAuthority>;
    seatAuthoritiesByConfig: Map<SeatConfiguration, SeatAuthority>;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlBind({ id }: {
        id: BaseObject;
    }): void;
}
