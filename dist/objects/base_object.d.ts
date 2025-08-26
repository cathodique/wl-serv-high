import { ObjectReference } from "@cathodique/wl-serv-low";
import type { WlRegistry } from "./wl_registry";
import { HLConnection } from "../index";
export declare class BaseObject<T extends Record<string, any[]> | [never] = Record<string, any[]> | [never]> extends ObjectReference<T> {
    connection: HLConnection;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, newOid: number, parent?: ObjectReference<T>, version?: number);
    wlDestroy(): void;
    toString(): string;
    addCommand(eventName: string, args: Record<string, any>): void;
    get registry(): WlRegistry | undefined;
}
