import { BaseObject } from "./base_object.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
export declare class WlDataOffer extends BaseObject {
    constructor(conx: HLConnection, args: Record<string | symbol, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
}
