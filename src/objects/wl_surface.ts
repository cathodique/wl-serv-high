import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { InstructionType, RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { XdgSurface } from "./xdg_surface.js";
import { HLConnection } from "../index.js";
import { interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import { OutputAuthority, OutputConfiguration, WlOutput } from "./wl_output.js";
import { SeatConfiguration, WlSeat } from "./wl_seat.js";
import { WlDataDevice } from "./wl_data_device.js";

interface KeyboardEvents extends Record<string, any[]> {
  keyDown: [SeatConfiguration, number];
  keyUp: [SeatConfiguration, number];
  modifier: [SeatConfiguration, number, number, number, number]; // depressed, latched, locked, group
  focus: [SeatConfiguration, number[]]; // keys[]
  blur: [SeatConfiguration];
}
interface PointerEvents extends Record<string, any[]> {
  enter: [SeatConfiguration, number, number];
  moveTo: [SeatConfiguration, number, number];
  leave: [SeatConfiguration];
  buttonDown: [SeatConfiguration, number];
  buttonUp: [SeatConfiguration, number];
}
interface OutputEvents extends Record<string, any[]> {
  shown: [OutputConfiguration];
}
type SurfaceEvents = KeyboardEvents & PointerEvents & OutputEvents & { updateRole: [SurfaceRoles] };

// TODO: Have SurfaceRoles be XdgPopup | XdgToplevel | WlPointer | WlSubsurface
type SurfaceRoles = "cursor" | "toplevel" | "popup" | "subsurface";

export class WlSurface extends BaseObject<SurfaceEvents> {
  xdgSurface: XdgSurface | null = null;
  daughterSurfaces: Set<WlSurface> = new Set();
  subsurface: WlSubsurface | null = null;

  opaqueRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([], this);
  inputRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([], this);
  surfaceDamage: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([], this);
  bufferDamage: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([], this);
  buffer: DoubleBuffer<WlBuffer | null | undefined> = new DoubleBuffer(undefined, this);
  scale: DoubleBuffer<number> = new DoubleBuffer(1, this);
  offset: DoubleBuffer<[number, number]> = new DoubleBuffer([0, 0], this);

  role?: SurfaceRoles;
  roleActive: boolean = false;
  setRole(role: SurfaceRoles) {
    // TODO: Error here if surface already has role
    this.role = role;
    this.roleActive = true;
    this.emit("updateRole");
  }
  dropRole() {
    this.roleActive = false;
    this.emit("dropRole");
  }
  doubleBufferedState: Set<DoubleBuffer<any>> = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale, this.surfaceDamage, this.bufferDamage, this.offset]);

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);
  }

  outputs: Set<OutputAuthority> = new Set();
  shown(output: OutputConfiguration) {
    const outputAuth = this.connection.display.outputAuthorities.get(output)!;
    this.outputs.add(outputAuth);

    const dataDevices = (this.connection.instances.get('wl_data_device') as WlDataDevice[] | undefined);
    dataDevices?.forEach(function (this: WlSurface, dataDevice: WlDataDevice) {
      dataDevice.surfaceFocusCallback.bind(dataDevice);
    }.bind(this));

    outputAuth.forAll(function (this: WlSurface, wlOutput: WlOutput) {
      this.addCommand('enter', { output: wlOutput });
      this.connection.sendPending();
    }.bind(this));
  }

  wlSetOpaqueRegion(args: { region: WlRegion }) {
    this.opaqueRegions.pending = args.region?.instructions;
  }
  wlSetInputRegion(args: { region: WlRegion }) {
    this.inputRegions.pending = args.region?.instructions;
  }

  wlOffset({ y, x }: { y: number, x: number }) {
    this.offset.pending = [y, x];
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
    if (args.buffer) args.buffer.surface = this;
  }

  get synced(): boolean {
    if (!this.subsurface) return false;
    return this.subsurface.isSynced || this.subsurface.assocParent.synced;
  }

  update() {
    for (const doubleBuffed of this.doubleBufferedState) {
      doubleBuffed.cached = doubleBuffed.pending;
    }
    this.bufferDamage.pending = [];
    this.surfaceDamage.pending = [];

    this.buffer.pending = undefined;
    if (!this.subsurface) this.applyCache();
    if (this.subsurface && !this.subsurface.isSynced) this.applyCache();
  }
  applyCache() {
    this.daughterSurfaces.forEach((surf) => surf.applyCache());

    for (const doubleBuffed of this.doubleBufferedState) {
      // if (doubleBuffed.current instanceof WlBuffer && doubleBuffed.current !== doubleBuffed.cached) doubleBuffed.current.wlRelease();
      doubleBuffed.current = doubleBuffed.cached;
    }
  }

  wlCommit() {
    console.log('Committing', this.oid);

    this.update();

    this.emit('update');

    if (this.buffer.current) {
      this.buffer.current.addCommand('release', {});
      console.log('Releasing', this.buffer.current.oid);

      this.connection.sendPending();
    }
  }

  wlDamage({ y, x, height, width }: { y: number, x: number, height: number, width: number }) {
    this.surfaceDamage.pending.push(new RegRectangle(InstructionType.Add, y, x, height, width));
  }
  wlDamageBuffer({ y, x, height, width }: { y: number, x: number, height: number, width: number }) {
    this.bufferDamage.pending.push(new RegRectangle(InstructionType.Add, y, x, height, width));
  }

  getCurrlyDammagedBuffer() {
    const surfaceDamageTransformed = this.surfaceDamage.current.map(function (this: WlSurface, v: RegRectangle) {
      return v.copyWithDelta(this.offset.current[0], this.offset.current[1]);
    }.bind(this));

    // Do some kind of algorithm, i guess... to avoid copying the same memory regions multiple times
    // Ill look at that later tho.
    // "Premature optimisation is the root of all evil"

    return [...surfaceDamageTransformed, ...this.bufferDamage.current]
  }
}
