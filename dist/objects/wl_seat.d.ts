import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { BaseObject } from "./base_object.js";
import { SpecificRegistry } from "../lib/specific_registry";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";
export interface SeatConfiguration {
    name: string;
    capabilities: number;
}
type SeatServerToClient = {
    'enter': [WlSurface, number, number];
    'moveTo': [number, number];
    'leave': [WlSurface];
    'buttonDown': [number];
    'buttonUp': [number];
    'focus': [WlSurface];
    'blur': [WlSurface];
};
export type SeatEventServer = EventServer<SeatServerToClient, {}>;
export type SeatEventClient = EventClient<{}, SeatServerToClient>;
export declare class SeatRegistry extends SpecificRegistry<SeatConfiguration, SeatEventServer> {
    get iface(): "wl_seat";
}
export declare class WlSeat extends BaseObject {
    info: SeatConfiguration;
    seatRegistry: SeatRegistry;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
}
export {};
