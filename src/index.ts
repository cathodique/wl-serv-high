import { Compositor, Connection, ConnectionParams } from "@cathodique/wl-serv-low";
import { WlRegistryMetadata } from "./objects/wl_registry";
import { WlKeyboardMetadata } from "./objects/wl_keyboard";
import { USocket } from "@cathodique/usocket";
import { Time } from "./lib/time";
import { BaseObject } from "./objects/base_object";
import { TickAuthority } from "./lib/tickAuthority";
import { SerialAuthority } from "./lib/serialAuthority";
import { readdir } from "node:fs/promises";
import { WlDisplay } from "./objects/wl_display";

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
      .map((v) => Number(v.slice('wayland-'.length))), 0); // Look im tired ok.

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

    this.display = new WlDisplay({
      oid: 1,
      type: 'wl_display',
      connection: this,
    });
    this.createObject(this.display);

    // Handle client disconnect
    sock.on("end", function (this: HLConnection) {
      const deleteMe = [...this.objects.values()];
      for (let i = deleteMe.length - 1; i >= 1; i -= 1) {
        deleteMe[i].wlDestroy();
      }
    }.bind(this));
  }
}
