import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { InstructionType, RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { XdgSurface } from "./xdg_surface.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { WlOutput } from "./wl_output.js";
import { WlDataDevice } from "./wl_data_device.js";
import { OutputConfiguration, OutputInstances } from "../registries/objectRegistry/output.js";
import { SeatConfiguration } from "../registries/objectRegistry/seat.js";
import { CUCont } from "../lib/content_update.js";

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

  opaqueRegions: RegRectangle[] = [];
  inputRegions: RegRectangle[] = [];
  surfaceDamage: RegRectangle[] = [];
  bufferDamage: RegRectangle[] = [];
  buffer: WlBuffer | null | undefined = undefined;
  scale: number = 1;
  offset: [number, number] = [0, 0];

  // TODO: Add getter/setter to check role stays the same (_role, _roleActive)
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

  cont: CUCont;
  constructor(initCtx: NewObjectDescriptor) {
    super(initCtx);

    this.cont = new CUCont("desync");
  }

  outputs: Set<OutputInstances> = new Set();
  currentOutput?: OutputInstances;
  enterOutput(output: OutputConfiguration) {
    const outputInstances = this.connection.display.outputRegistry.get(output)!.get(this.connection)!;
    this.outputs.add(outputInstances);

    // TODO: fix ???
    const dataDevices = (this.connection.instances.get('wl_data_device') as WlDataDevice[] | undefined);
    dataDevices?.forEach(function (this: WlSurface, dataDevice: WlDataDevice) {
      dataDevice.surfaceFocusCallback();
    }.bind(this));

    outputInstances.forAll(function (this: WlSurface, wlOutput: WlOutput) {
      this.addCommand('enter', { output: wlOutput });
      this.connection.sendPending();
    }.bind(this));
  }
  leaveOutput(output: OutputConfiguration) {
    const outputInstances = this.connection.display.outputRegistry.get(output)!.get(this.connection)!;
    this.outputs.delete(outputInstances);

    outputInstances.forAll(function (this: WlSurface, wlOutput: WlOutput) {
      this.addCommand('leave', { output: wlOutput });
      this.connection.sendPending();
    }.bind(this));
  }

  wlSetOpaqueRegion(args: { region: WlRegion }) {
    this.cont.appendAction(() => { this.opaqueRegions = args.region?.instructions });
  }
  wlSetInputRegion(args: { region: WlRegion }) {
    this.cont.appendAction(() => { this.inputRegions = args.region?.instructions });
  }

  wlOffset({ y, x }: { y: number, x: number }) {
    this.cont.appendAction(() => { this.offset = [y, x] });
  }

  wlFrame({ callback: cbId }: { callback: NewObjectDescriptor }) {
    const callback = new WlCallback(cbId);
    this.connection.createObject(callback);

    this.connection.hlCompositor.ticks.once('tick', (function (this: WlSurface) {
      callback.done(this.connection.time.getTime());
      this.connection.sendPending();
    }).bind(this));
  }

  wlSetBufferScale(args: { scale: number }) {
    this.cont.appendAction(() => { this.scale = args.scale; });
  }

  wlAttach(args: { buffer: WlBuffer | null }) {
    this.cont.appendAction(() => { this.buffer = args.buffer; });
    if (args.buffer) args.buffer.surface = this;
  }

  get synced(): boolean {
    if (!this.subsurface) return false;
    return this.subsurface.isSynced || this.subsurface.meta.parent.synced;
  }

  update() {
    // for (const doubleBuffed of this.doubleBufferedState) {
    //   doubleBuffed.cached = doubleBuffed.pending;
    // }
    // this.bufferDamage.pending = [];
    // this.surfaceDamage.pending = [];

    // this.buffer.pending = undefined;
    // if (!this.subsurface) this.applyCache();
    // if (this.subsurface && !this.subsurface.isSynced) this.applyCache();

    this.cont.appendAction(() => {
      if (this.pendingDamage.length > 0) this.surfaceDamage = this.pendingDamage;
    });
    this.cont.appendAction(() => {
      if (this.pendingBufferDamage.length > 0) this.bufferDamage = this.pendingBufferDamage;
    });

    this.cont.commit([]);
  }

  wlCommit() {
    this.update();

    this.emit('update');

    if (this.buffer) {
      this.buffer.addCommand('release', {});

      this.connection.sendPending();
    }
  }

  pendingDamage: RegRectangle[] = [];
  wlDamage({ y, x, height, width }: { y: number, x: number, height: number, width: number }) {
    this.cont.appendAction(() => {
      this.pendingDamage.push(new RegRectangle(InstructionType.Add, y, x, height, width));
    });
  }
  pendingBufferDamage: RegRectangle[] = [];
  wlDamageBuffer({ y, x, height, width }: { y: number, x: number, height: number, width: number }) {
    this.cont.appendAction(() => {
      this.pendingBufferDamage.push(new RegRectangle(InstructionType.Add, y, x, height, width));
    });
  }

  getCurrlyDammagedBuffer() {
    const surfaceDamageTransformed = this.surfaceDamage.map(function (this: WlSurface, v: RegRectangle) {
      return v.copyWithDelta(this.offset[0], this.offset[1]);
    }.bind(this));

    // Do some kind of algorithm, i guess... to avoid copying the same memory regions multiple times
    // Ill look at that later tho.
    // "Premature optimisation is the root of all evil"

    return [...surfaceDamageTransformed, ...this.bufferDamage]
  }
}
