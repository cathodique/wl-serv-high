import { BaseObject } from "./base_object.js";
import { fromServer } from "../misc/fromServerSymbol.js";
import { Connection, ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";

const name = 'wl_data_offer' as const;
export class WlDataOffer extends BaseObject {
  constructor(conx: HLConnection, args: Record<string | symbol, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    if (!args[fromServer]) throw new Error("Data offer may only be instantiated by the server");
    super(conx, args, ifaceName, oid, parent, version);

    this.addCommand('offer', { mimeType: args.mimeType });
  }
}
