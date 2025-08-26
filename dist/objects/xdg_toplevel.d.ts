import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
export declare class XdgToplevel extends BaseObject {
    appId?: string;
    assocParent: XdgToplevel | null;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    wlSetAppId(args: {
        appId: string;
    }): void;
    wlSetParent(args: {
        parent: XdgToplevel;
    }): void;
    get renderReady(): boolean;
}
