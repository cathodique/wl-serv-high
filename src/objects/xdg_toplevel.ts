import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { ZxdgToplevelDecorationV1 } from "./zxdg_decoration_manager_v1.js";
import { EventEmitter } from "node:stream";

const anyValue = <T>(s: Set<T> | Map<any, T>): T | undefined => s.values().next().value;

type PossibleStates = "maximized" | "fullscreen" | "resizing" | "activated"
  | "tiled_left" | "tiled_right" | "tiled_top" | "tiled_bottom"
  | "suspended"
  | "constrained_left" | "constrained_right" | "constrained_top" | "constrained_bottom";

class EventfulSet<T> extends Set<T> {
  event: EventEmitter = new EventEmitter();

  add(v: T): this {
    super.add(v);
    this.event.emit('change');
    return this;
  }
  delete(v: T): boolean {
    const result = super.delete(v);
    this.event.emit('change');
    return result;
  }
  clear(): void {
    if (this.size != 0) {
      super.clear();
      this.event.emit('change');
    }
  }
}

export class XdgToplevel extends BaseObject {
  appId?: string;
  title?: string;
  activated: boolean = false;

  parent: XdgSurface;

  assocParent: XdgToplevel | null = null;

  lastDimensions: [number, number] = [0, 0];

  decoration?: ZxdgToplevelDecorationV1;

  readonly states: EventfulSet<PossibleStates> = new EventfulSet();

  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);

    if (!(initCtx.parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    this.parent = initCtx.parent;

    this.parent.toplevel = this;
    this.parent.role = "toplevel";
    this.parent.surface.setRole("toplevel");

    this.configureSequence(true, true);
    this.parent.surface.on("wlCommit", function (this: XdgToplevel) {
      if (!(
        this.parent.geometry.current.height === this.lastDimensions[0]
        && this.parent.geometry.current.width === this.lastDimensions[1]
      )) {
        this.lastDimensions = [this.parent.geometry.current.height, this.parent.geometry.current.width];
        this.configureSequence(true, false);
      }
    }.bind(this));
  }

  configureSequence(window: boolean, capabilities: boolean) {
    // TODO: Let DE configure which default output to use
    const defaultOutput = anyValue(this.connection.display.outputAuthorities)!.config;
    const currentOutput = anyValue(this.parent.surface.outputs)?.config || defaultOutput;

    // TODO: Retrieve that automatically (from config or sth idk)
    this.addCommand('configureBounds', {
      width: currentOutput.effectiveW,
      height: currentOutput.effectiveH,
    });

    if (capabilities) {
      this.addCommand('wmCapabilities', { capabilities: Buffer.alloc(0) });
    }

    if (window) {
      this.addCommand('configure', {
        width: this.lastDimensions[1],
        height: this.lastDimensions[0],
        states: Buffer.from(
          [...this.states]
            .map((v) => interfaces.xdg_surface.enums.states.atoi[v])
        ),
      });
    }

    this.parent.addCommand('configure', { serial: this.parent.newSerial() });
  }

  wlSetTitle(args: { title: string }) {
    this.title = args.title;
  }

  wlSetAppId(args: { appId: string }) {
    this.appId = args.appId;
  }

  wlSetParent(args: { parent: XdgToplevel }) {
    // TODO: Check if is mapped
    this.assocParent = args.parent;
  }

  get renderReady() {
    // Check if the top-level has been set-up enough to be render-ready
    return true;
  }
}
