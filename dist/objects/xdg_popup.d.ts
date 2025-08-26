import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
export declare class XdgPopup extends BaseObject {
    appId?: string;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number);
    get renderReady(): boolean;
}
