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
  subsurfaceOrder: WlSurface[] = [];
  subsurface: WlSubsurface | null = null;

  opaqueRegions: RegRectangle[] = [];
  inputRegions: RegRectangle[] = [];
  surfaceDamage: RegRectangle[] = [];
  bufferDamage: RegRectangle[] = [];
  buffer: WlBuffer | null | undefined = undefined;
  previousBuffer: WlBuffer | null | undefined = undefined;
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

  wlSetOpaqueRegion(args: { region: WlRegion | null }) {
    this.cont.appendAction(() => { this.opaqueRegions = args.region ? args.region.instructions : []; });
  }

  wlSetInputRegion(args: { region: WlRegion | null }) {
    this.cont.appendAction(() => { this.inputRegions = args.region ? args.region.instructions : []; });
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
    this.cont.appendAction(() => {
      const oldBuffer = this.buffer;
      this.buffer = args.buffer;
      if (oldBuffer && oldBuffer !== this.buffer) {
        this.previousBuffer = oldBuffer;
        const conn = this.connection;
        oldBuffer.pendingRelease = () => {
          oldBuffer.addCommand('release', {});
          conn.sendPending();
        };
      }
      if (args.buffer) args.buffer.surface = this;
    });
  }

  get synced(): boolean {
    if (!this.subsurface) return false;
    return this.subsurface.isSynced || this.subsurface.meta.parent.synced;
  }

  update() {
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
    const prev = this.previousBuffer;
    this.emit('update');
    // If previousBuffer was not consumed/released by custom rendering listener, release it now
    if (this.previousBuffer && this.previousBuffer === prev) {
      this.previousBuffer.release?.();
      this.previousBuffer = undefined;
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

    return [...surfaceDamageTransformed, ...this.bufferDamage]
  }

  wlDestroy() {
    this.buffer?.release?.();
    this.buffer = null;
    this.previousBuffer?.release?.();
    this.previousBuffer = null;
    super.wlDestroy();
  }
}
