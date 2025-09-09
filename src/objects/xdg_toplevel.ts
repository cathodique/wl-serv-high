import { HLConnection } from "../index.js";
import { BaseObject } from "./base_object.js";
import { XdgSurface } from "./xdg_surface.js";

const name = 'xdg_toplevel' as const;
export class XdgToplevel extends BaseObject {
  appId?: string;
  title?: string;

  assocParent: XdgToplevel | null = null;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    if (!(parent instanceof XdgSurface)) throw new Error('Parent must be xdg_surface');
    super(conx, args, ifaceName, oid, parent, version);

    parent.role = this;
    parent.surface.setRole("toplevel");

    // const config = this.registry!.;

    // TODO: Let DE configure which output to use
    const currentOutput = parent.surface.output || this.registry!.outputAuthorities.values().next().value!.config;

    // TODO: Retrieve that automatically (from config or sth idk)
    this.addCommand('configureBounds', { width: currentOutput.effectiveW, height: currentOutput.effectiveH });
    this.addCommand('wmCapabilities', { capabilities: Buffer.alloc(0) });
    this.addCommand('configure', { width: 0, height: 0, states: Buffer.alloc(0) });
    parent.addCommand('configure', { serial: parent.newSerial() });
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
