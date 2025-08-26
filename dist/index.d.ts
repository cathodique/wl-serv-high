import { Compositor, Connection, ConnectionParams } from "@cathodique/wl-serv-low";
import { WlRegistryMetadata } from "./objects/wl_registry";
import { WlKeyboardMetadata } from "./objects/wl_keyboard";
import { USocket } from "@cathodique/usocket";
import { Time } from "./lib/time";
import { BaseObject } from "./objects/base_object";
import { TickAuthority } from "./lib/tickAuthority";
export type ObjectMetadata = {
    wl_registry: WlRegistryMetadata;
    wl_keyboard: WlKeyboardMetadata;
};
export declare class HLCompositor extends Compositor<BaseObject, HLConnection> {
    metadata: ObjectMetadata;
    ticks: TickAuthority;
    constructor(metadata: ObjectMetadata);
    start(): Promise<void>;
}
export declare class HLConnection extends Connection<BaseObject> {
    time: Time;
    get hlCompositor(): HLCompositor;
    constructor(connId: number, comp: HLCompositor, sock: USocket, params: ConnectionParams<BaseObject, HLConnection>);
}
