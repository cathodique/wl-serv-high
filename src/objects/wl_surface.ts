import { BaseObject } from "./base_object.js";
import { WlBuffer } from "./wl_buffer.js";
import { InstructionType, RegRectangle, WlRegion } from "./wl_region.js";
import { WlCallback } from "./wl_callback.js";
import { WlSubsurface } from "./wl_subsurface.js";
import { DoubleBuffer } from "../lib/doublebuffer.js";
import { XdgSurface } from "./xdg_surface.js";
import { HLConnection } from "../index.js";
import { interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import { OutputConfiguration, WlOutput } from "./wl_output.js";
import { SeatConfiguration, WlSeat } from "./wl_seat.js";

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
  daughterSurfaces: WlSurface[] = [];
  subsurface: WlSubsurface | null = null;

  opaqueRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  inputRegions: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  surfaceDamage: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  bufferDamage: DoubleBuffer<RegRectangle[]> = new DoubleBuffer([]);
  buffer: DoubleBuffer<WlBuffer | null> = new DoubleBuffer(null);
  scale: DoubleBuffer<number> = new DoubleBuffer(1);
  offset: DoubleBuffer<[number, number]> = new DoubleBuffer([0, 0]);

  role?: SurfaceRoles;
  setRole(role: SurfaceRoles) {
    this.role = role;
    this.emit("updateRole");
  }

  doubleBufferedState: Set<DoubleBuffer<any>> = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale, this.surfaceDamage, this.bufferDamage]);

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);
    this.handleMouse();
    this.handleKeyboard();
    this.handleOutput();
  }

  handleMouse() {
    this.on('enter', (function (this: WlSurface, seatConf: SeatConfiguration, surfX: number, surfY: number) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToPointers('enter', {
          serial: this.connection.serial.next(),
          surface: this,
          surfaceX: surfX,
          surfaceY: surfY,
        });
        wlSeat.addCommandToPointers('frame', {});
        wlSeat.addCommandToPointers('motion', {
          time: (this.connection as HLConnection).time.getTime(),
          surfaceX: surfX,
          surfaceY: surfY,
        });
        wlSeat.addCommandToPointers('frame', {});
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('moveTo', (function (this: WlSurface, seatConf: SeatConfiguration, surfX: number, surfY: number) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToPointers('motion', {
          time: (this.connection as HLConnection).time.getTime(),
          surfaceX: surfX,
          surfaceY: surfY,
        });
        wlSeat.addCommandToPointers('frame', {});
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('leave', (function (this: WlSurface, seatConf: SeatConfiguration) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToPointers('leave', {
          serial: (this.connection as HLConnection).serial.next(),
          surface: this,
        });
        wlSeat.addCommandToPointers('frame', {});
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('buttonDown', (function (this: WlSurface, seatConf: SeatConfiguration, button: number) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToPointers('button', {
          serial: (this.connection as HLConnection).serial.next(),
          time: this.connection.time.getTime(),
          button: button,
          state: interfaces.wl_pointer.enums.buttonState.atoi.pressed,
        });
        wlSeat.addCommandToPointers('frame', {});
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('buttonUp', (function (this: WlSurface, seatConf: SeatConfiguration, button: number) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToPointers('button', {
          serial: (this.connection as HLConnection).serial.next(),
          time: this.connection.time.getTime(),
          button: button,
          state: interfaces.wl_pointer.enums.buttonState.atoi.released,
        });
        wlSeat.addCommandToPointers('frame', {});
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
  }

  output: OutputConfiguration | null = null;
  handleOutput() {
    this.on('shown', function (this: WlSurface, output: OutputConfiguration) {
      const outputAuth = this.registry!.outputAuthoritiesByConfig.get(output)!;
      this.output = output;

      outputAuth.forAll(function (this: WlSurface, wlOutput: WlOutput) {
        this.addCommand('enter', { output: wlOutput });
        this.connection.sendPending();
      }.bind(this));
    }.bind(this));
  }

  handleKeyboard() {
    this.on('modifiers', (function (this: WlSurface, seatConf: SeatConfiguration, keysDown: number[]) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        throw new Error('Not implemented');

        wlSeat.addCommandToKeyboards('modifiers', {
          serial: (this.connection as HLConnection).time.getTime(),
          surface: this,
          keys: Buffer.from(keysDown),
        });
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));

    this.on('focus', (function (this: WlSurface, seatConf: SeatConfiguration, keysDown: number[]) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToKeyboards('enter', {
          serial: (this.connection as HLConnection).time.getTime(),
          surface: this,
          keys: Buffer.from(keysDown),
        });
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('blur', (function (this: WlSurface, seatConf: SeatConfiguration) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToKeyboards('leave', {
          serial: (this.connection as HLConnection).time.getTime(),
          surface: this,
        });
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));

    this.on('keyDown', (function (this: WlSurface, seatConf: SeatConfiguration, keyDown: number, isRepeat?: boolean) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      const keyStateEnum = interfaces.wl_keyboard.enums.keyState.atoi;
      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToKeyboards('key', {
          serial: (this.connection as HLConnection).serial.next(),
          time: (this.connection as HLConnection).time.getTime(),
          key: keyDown - 8,
          state: isRepeat ? keyStateEnum.repeated : keyStateEnum.pressed,
        });
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
    this.on('keyUp', (function (this: WlSurface, seatConf: SeatConfiguration, keyUp: number) {
      const seatAuth = this.registry!.seatAuthoritiesByConfig.get(seatConf)!;

      seatAuth.forAll(function (this: WlSurface, wlSeat: WlSeat) {
        wlSeat.addCommandToKeyboards('key', {
          serial: (this.connection as HLConnection).serial.next(),
          time: (this.connection as HLConnection).time.getTime(),
          key: keyUp - 8,
          state: interfaces.wl_keyboard.enums.keymapFormat.atoi.released,
        });
      }.bind(this));
      this.connection.sendPending();
    }).bind(this));
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

    this.buffer.pending = null;
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
