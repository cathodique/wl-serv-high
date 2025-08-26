import { ObjectReference } from "@cathodique/wl-serv-low";
import type { WlRegistry } from "./wl_registry";
import { HLConnection } from "../index";

export class BaseObject<T extends Record<string, any[]> | [never] = Record<string, any[]> | [never]> extends ObjectReference<T> {
  connection: HLConnection;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, newOid: number, parent?: ObjectReference<T>, version?: number) {
    super(ifaceName, newOid, parent, version);
    this.connection = conx;
  }

  wlDestroy() {
    this.connection.destroy(this.oid);
  }

  toString() {
    return `[wlObject ${this.iface}]`;
  }

  addCommand(eventName: string, args: Record<string, any>) {
    this.connection.addCommand(this, eventName, args);
  }

  get registry(): WlRegistry | undefined {
    if (this.parent === this) return undefined;
    return (this.parent as BaseObject).registry;
  }
}
