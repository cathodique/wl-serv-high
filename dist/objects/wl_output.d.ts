import { BaseObject } from "./base_object.js";
import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { SpecificRegistry } from "../lib/specific_registry.js";
import { WlSurface } from "./wl_surface.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
type OutputServerToClient = {
    'update': [];
    'enter': [WlSurface];
};
export type OutputEventServer = EventServer<OutputServerToClient, {}>;
export type OutputEventClient = EventClient<{}, OutputServerToClient>;
export declare class OutputRegistry extends SpecificRegistry<OutputConfiguration, OutputEventServer> {
    get iface(): "wl_output";
    current: OutputConfiguration;
    constructor(v: OutputConfiguration[], current?: OutputConfiguration);
}
export interface OutputConfiguration {
    x: number;
    y: number;
    w: number;
    h: number;
    effectiveW: number;
    effectiveH: number;
}
export declare class WlOutput extends BaseObject {
    info: OutputConfiguration;
    recipient: OutputEventClient;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    advertise(): void;
    release(): void;
}
export {};
