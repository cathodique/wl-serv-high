import { interfaces, NewObjectDescriptor, ObjectReference } from "@cathodique/wl-serv-low";
import type { WlRegistry } from "./wl_registry.js";
import { HLConnection } from "../index.js";

class ImplementationError extends Error {

}

export interface NewObjectDescriptorWithConx extends Omit<NewObjectDescriptor, "parent"> {
  connection: HLConnection;
}

export class BaseObject<T extends Record<string, any[]> | [never] = Record<string, any[]> | [never]> extends ObjectReference<T> {
  process() {}

  connection: HLConnection;
  parent: BaseObject;

  constructor(initCtx: NewObjectDescriptor | NewObjectDescriptorWithConx) {
    if ("parent" in initCtx) {
      if (initCtx.parent instanceof BaseObject) {
        super(initCtx.type, initCtx.oid, initCtx.parent, initCtx.version);

        this.parent = initCtx.parent;
        this.connection = initCtx.parent.connection;
      } else {
        throw new Error("Parent of a BaseObject must be a BaseObject");
      }

    } else {
      super(initCtx.type, initCtx.oid);

      this.parent = this;
      this.connection = initCtx.connection;
    }
    // this.connection.createObject(this);
    // Bad side-effect apparently...
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
