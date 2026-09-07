import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";
import { ZxdgToplevelDecorationV1 } from "./zxdg_decoration_manager_v1.js";
import { StatifiedSet } from "informa/dist/quirks/set.js";
import type { WlSeat } from "./wl_seat.js";

const anyValue = <T>(s: Set<T> | Map<any, T>): T | undefined => s.values().next().value;

type PossibleStates = "maximized" | "fullscreen" | "resizing" | "activated"
  | "tiled_left" | "tiled_right" | "tiled_top" | "tiled_bottom"
  | "suspended"
  | "constrained_left" | "constrained_right" | "constrained_top" | "constrained_bottom";

export class XdgToplevel extends BaseObject {
  appId?: string;
  title?: string;
  activated: boolean = false;

  parent: XdgSurface;

  assocParent: XdgToplevel | null = null;

  lastDimensions: [number, number] = [0, 0];

  decoration?: ZxdgToplevelDecorationV1;

  readonly states = new StatifiedSet<PossibleStates>();

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
        this.parent.geometry.height === this.lastDimensions[0]
        && this.parent.geometry.width === this.lastDimensions[1]
      )) {
        this.lastDimensions = [this.parent.geometry.height, this.parent.geometry.width];
        this.configureSequence(true, false);
      }
    }.bind(this));
  }

  configureSequence(window: boolean, capabilities: boolean) {
    // TODO: Let DE configure which default output to use
    const defaultOutput = anyValue(this.connection.display.outputRegistry)!.config;
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
            .map((v) => interfaces.xdg_toplevel.enums.state.atoi[v])
        ),
      });
    }

    this.parent.addCommand('configure', { serial: this.parent.newSerial() });
  }

  wlSetTitle(args: { title: string }) {
    this.title = args.title;
    this.emit("set_title", args.title);
  }

  wlSetAppId(args: { appId: string }) {
    this.appId = args.appId;
    this.emit("set_app_id", args.appId);
  }

  wlSetParent(args: { parent: XdgToplevel }) {
    // TODO: Check if is mapped
    this.assocParent = args.parent;
  }

  wlMove(args: { seat: WlSeat; serial: number }) {
    this.emit("move", args);
  }

  wlResize(args: { seat: WlSeat; serial: number; edges: number }) {
    this.emit("resize", args);
  }

  wlSetMaximized() {
    this.states.add("maximized");
    this.configureSequence(true, false);
    this.emit("maximize");
  }

  wlUnsetMaximized() {
    this.states.delete("maximized");
    this.configureSequence(true, false);
    this.emit("unmaximize");
  }

  wlSetFullscreen() {
    this.states.add("fullscreen");
    this.configureSequence(true, false);
    this.emit("fullscreen");
  }

  wlUnsetFullscreen() {
    this.states.delete("fullscreen");
    this.configureSequence(true, false);
    this.emit("unfullscreen");
  }

  wlSetMinimized() {
    this.emit("minimize");
  }

  get renderReady() {
    // Check if the top-level has been set-up enough to be render-ready
    return true;
  }
}
