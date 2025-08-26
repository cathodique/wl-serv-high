import { ObjectReference } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { SeatEventClient } from "./wl_seat.js";
import { HLConnection } from "../index.js";
export declare class WlPointer extends BaseObject {
    recipient: SeatEventClient;
    latestSerial: number | null;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
}
