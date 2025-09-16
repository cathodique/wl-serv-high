import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { ZxdgDecorationManagerV1 } from "./zxdg_decoration_manager_v1.js";
export declare class XdgToplevel extends BaseObject {
    appId?: string;
    title?: string;
    assocParent: XdgToplevel | null;
    lastDimensions: [number, number];
    decoration?: ZxdgDecorationManagerV1;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    configureSequence(window: boolean, capabilities: boolean): void;
    wlSetTitle(args: {
        title: string;
    }): void;
    wlSetAppId(args: {
        appId: string;
    }): void;
    wlSetParent(args: {
        parent: XdgToplevel;
    }): void;
    get renderReady(): boolean;
}
