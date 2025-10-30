import { interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import type { WlRegistry } from "./wl_registry";
import { HLConnection } from "../index";

class ImplementationError extends Error {

}

export class BaseObject<T extends Record<string, any[]> | [never] = Record<string, any[]> | [never]> extends ObjectReference<T> {
  process() {}

  connection: HLConnection;
  parent: BaseObject;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, newOid: number, parent?: ObjectReference<any>, version?: number) {
    super(ifaceName, newOid, parent, version);

    if (parent && !(parent instanceof BaseObject)) throw new Error("Parent of BaseObject must be BaseObject");
    this.parent = parent || this;

    this.connection = conx;
  }

  wlDestroy() {
    this.connection.destroy(this.oid);
    this.removeAllListeners();
  }

  toString() {
    return `[wlObject ${this.iface}]`;
  }

  addCommand(eventName: string, args: Record<string, any>) {
    this.connection.addCommand(this, eventName, args);
  }

  get registry(): WlRegistry | undefined {
    if (this.parent === this) return undefined;
    return this.parent.registry;
  }

  raiseError(errorName: string, description?: string) {
    const errorEnum = interfaces[this.iface].enums.error;

    if (!(errorName in errorEnum.atoi)) throw new ImplementationError("Error does not exist in this object");

    return this.connection.display.addCommand("error", {
      objectId: this.oid,
      code: errorEnum.atoi[errorName],
      description: description || "N/A",
    });
  }

  toJSON() {
    return `${this.iface}#${this.oid}`;
  }
}
