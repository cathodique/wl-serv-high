import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { XdgSurface } from "./xdg_surface.js";

export class WlSurface extends BaseObject {
  xdgSurface: XdgSurface | null = null;
  daughterSurfaces: WlSurface[] = [];
  subsurface: WlSubsurface | null = null;

  opaqueRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  inputRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  buffer: DoubleBuffer<WlBuffer | null> = new DoubleBuffer(null);
  scale: DoubleBuffer<number> = new DoubleBuffer(1);

  doubleBufferedState: Set<DoubleBuffer<any>> = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale]);

  surfaceToBufferDelta = [0, 0] as [number, number];

  wlSetOpaqueRegion(args: { region: WlRegion }) {
    this.opaqueRegions.pending = args.region?.instructions;
  }
  wlSetInputRegion(args: { region: WlRegion }) {
    this.inputRegions.pending = args.region?.instructions;
  }

  wlFrame({ callback }: { callback: WlCallback }) {
    this.connection.hlCompositor.ticks.once('tick', (function (this: WlSurface) {
      callback.done(this.connection.time.getTime());
      this.connection.sendPending();
    }).bind(this));
  }

  wlSetBufferScale(args: { scale: number }) {
    this.scale.pending = args.scale;
  }

  wlAttach(args: { buffer: WlBuffer | null }) {
    this.buffer.pending = args.buffer;
  }

  get synced(): boolean {
    if (!this.subsurface) return false;
    return this.subsurface.isSynced || this.subsurface.assocParent.synced;
  }

  update() {
    for (const doubleBuffed of this.doubleBufferedState) {
      doubleBuffed.cached = doubleBuffed.pending;
    }
    if (!this.subsurface) this.applyCache();
    if (this.subsurface && !this.subsurface.isSynced) this.applyCache();
  }
  applyCache() {
    this.daughterSurfaces.forEach((surf) => surf.applyCache());

    for (const doubleBuffed of this.doubleBufferedState) {
      // if (doubleBuffed.current instanceof WlBuffer && doubleBuffed.current !== doubleBuffed.cached) doubleBuffed.current.wlRelease();
      doubleBuffed.current = doubleBuffed.cached;
    }
    this.buffer.pending = null;
  }

  wlCommit() {
    this.update();

    this.emit('update');

    if (this.buffer.current) {
      this.buffer.current.addCommand('release', {});
    }
  }
}
