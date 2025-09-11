import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";

const name = 'xdg_toplevel' as const;
export class XdgToplevel extends BaseObject {
  appId?: string;
  title?: string;

  assocParent: XdgToplevel | null = null;

  lastDimensions: [number, number] = [0, 0];

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    if (!(parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    super(conx, args, ifaceName, oid, parent, version);

    parent.role = this;
    parent.surface.setRole("toplevel");

    // const config = this.registry!.;

    this.configureSequence(true, true);
    parent.surface.on("wlCommit", function (this: XdgToplevel) {
      const buf = parent.surface.buffer.current;
      if (buf && !(buf.height === this.lastDimensions[0] && buf.width === this.lastDimensions[1])) {
        this.configureSequence(true, false);
        this.lastDimensions = [buf.height, buf.width];
      }
    }.bind(this));
  }

  configureSequence(window: boolean, capabilities: boolean) {
    // TODO: Let DE configure which output to use
    const maybeDefaultOutput = this.connection.display.outputAuthorities.values().next().value!.config;
    const currentOutput = (this.parent as XdgSurface).surface.output || maybeDefaultOutput;

    // TODO: Retrieve that automatically (from config or sth idk)
    this.addCommand('configureBounds', { width: currentOutput.effectiveW, height: currentOutput.effectiveH });
    this.addCommand('wmCapabilities', { capabilities: Buffer.alloc(0) });
    this.addCommand('configure', { width: this.lastDimensions[1], height: this.lastDimensions[0], states: Buffer.alloc(0) });
    (this.parent as XdgSurface).addCommand('configure', { serial: (this.parent as XdgSurface).newSerial() });
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
