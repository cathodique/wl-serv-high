import { Compositor, Connection, ConnectionParams } from "@cathodique/wl-serv-low";
import { WlRegistryMetadata } from "./objects/wl_registry";
import { WlKeyboardMetadata } from "./objects/wl_keyboard";
import { USocket } from "@cathodique/usocket";
import { newIdMap } from "./new_id_map";
import { Time } from "./lib/time";
import { BaseObject } from "./objects/base_object";
import { TickAuthority } from "./lib/tickAuthority";
import { SerialAuthority } from "./lib/serialAuthority";
import { readdir } from "node:fs/promises";
import { WlDisplay } from "./objects/wl_display";

const getStackTrace = function() {
  const obj: Record<string, string> = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
};

export type ObjectMetadata = {
  wl_registry: WlRegistryMetadata;
  wl_keyboard: WlKeyboardMetadata;
};

export class HLCompositor extends Compositor<BaseObject, HLConnection> {
  metadata: ObjectMetadata;

  ticks: TickAuthority = new TickAuthority();

  constructor(metadata: ObjectMetadata) {
    super({
      socketPath: '',
      createConnection(this: Compositor<BaseObject, HLConnection>, connId: number, socket: USocket) {
        return new HLConnection(connId, this as HLCompositor, socket, {
          createObjRef(this: HLConnection, args, ifaceName, newOid, parent, version) {
            const isIn = (ifaceName: string): ifaceName is keyof typeof newIdMap => Object.hasOwn(newIdMap, ifaceName);
            if (!isIn(ifaceName)) {
              // console.log(ifaceName);
              throw new Error("Inexistant interface name in newIdMap");
            }
            return new newIdMap[ifaceName](this, args, ifaceName, newOid, parent, version);
          },
          call(object, fnName, args) {
            const methodCollection = object as unknown as Record<string, ((args: Record<string, any>) => any)>;
            object.emit(`before${fnName[0].toUpperCase()}${fnName.slice(1)}`, args);
            if (fnName in methodCollection) methodCollection[fnName](args);
            object.emit(fnName, args);
          },
        });
      },
    });

    this.metadata = metadata;
  }

  async start() {
    const xdgRuntimeDir = process.env.XDG_RUNTIME_DIR;
    if (typeof xdgRuntimeDir !== "string") throw new Error();

    const lastInUse = Math.max(...(await readdir(xdgRuntimeDir))
      .filter((v) => v.match(/^wayland-\d+$/))
      .map((v) => Number(v.slice('wayland-'.length)))); // Look im tired ok.

    this.params.socketPath = `${process.env.XDG_RUNTIME_DIR}/wayland-${lastInUse + 1}`;

    super.start();
  }
}

export class HLConnection extends Connection<BaseObject> {
  time: Time = new Time();

  // Fucking hell.
  // (I promise I tried.)
  get hlCompositor() { return this.compositor as unknown as HLCompositor }

  display: WlDisplay;
  serial: SerialAuthority = new SerialAuthority();

  constructor(
    connId: number,
    comp: HLCompositor,
    sock: USocket,
    params: ConnectionParams<BaseObject, HLConnection>,
  ) {
    super(connId, comp as unknown as Compositor<BaseObject, Connection<BaseObject>>, sock, params);

    // this.objects = new Map([[1, new WlDisplay(this, 1, null, {})]]);
    this.display = this.createObjRef({}, 'wl_display', 1) as WlDisplay;
    this.createObject(this.display);

    // Handle client disconnect
    sock.on("end", function (this: HLConnection) {
      const deleteMe = [...this.objects.values()];
      for (let i = deleteMe.length - 1; i >= 1; i -= 1) {
        deleteMe[i].wlDestroy();
      }
    }.bind(this));

    // this.hlCompositor.metadata.wl_registry.outputs.addConnection(this);
    // this.hlCompositor.metadata.wl_registry.seats.addConnection(this);
  }
}
