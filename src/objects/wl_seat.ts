import { BaseObject } from "./base_object.js";
import { HLConnection } from "../index.js";
import { WlPointer } from "./wl_pointer.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { ObjectAuthority } from "../lib/objectAuthority.js";
import { WlSurface } from "./wl_surface.js";
import { interfaces } from "@cathodique/wl-serv-low";

export interface SeatConfiguration {
  name: string;
  capabilities: number;
}

const name = 'wl_seat' as const;

// Edit from future me: What the fuck??
// type SeatServerToClient = {
//   'enter': [WlSurface, number, number];
//   'moveTo': [number, number];
//   'leave': [WlSurface];
//   'buttonDown': [number];
//   'buttonUp': [number];
//   'modifier': [WlSurface, number, number, number, ];
//   'focus': [WlSurface, number[]];
//   'blur': [WlSurface];
// };
// type SeatServerToClient = {};
// export type SeatEventServer = EventServer<SeatServerToClient, {}>;
// export type SeatEventClient = EventClient<{}, SeatServerToClient>;

export class SeatAuthority extends ObjectAuthority<WlSeat, SeatConfiguration> {
  modifiers(dep: number, latch: number, lock: number, group: number, serial?: number) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('modifiers', {
        serial: serial || this.connection.serial.next(),
        modsDepressed: dep,
        modsLatched: latch,
        modsLocked: lock,
        group: group,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  focus(surf: WlSurface, keysDown: number[]) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('enter', {
        serial: (this.connection as HLConnection).time.getTime(),
        surface: surf,
        keys: Buffer.from(keysDown),
      });
    }.bind(this));
    this.connection.sendPending();
  }
  blur(surf: WlSurface) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('leave', {
        serial: (this.connection as HLConnection).time.getTime(),
        surface: surf,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  keyDown(keyDown: number, isRepeat?: boolean) {
    const keyStateEnum = interfaces.wl_keyboard.enums.keyState.atoi;
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('key', {
        serial: (this.connection as HLConnection).serial.next(),
        time: (this.connection as HLConnection).time.getTime(),
        key: keyDown - 8,
        state: isRepeat ? keyStateEnum.repeated : keyStateEnum.pressed,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  keyUp(keyUp: number) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('key', {
        serial: (this.connection as HLConnection).serial.next(),
        time: (this.connection as HLConnection).time.getTime(),
        key: keyUp - 8,
        state: interfaces.wl_keyboard.enums.keymapFormat.atoi.released,
      });
    }.bind(this));
    this.connection.sendPending();
  }

  enter(surf: WlSurface, surfX: number, surfY: number) {
    const enterSerial = this.connection.serial.next();

    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('enter', {
        serial: enterSerial,
        surface: surf,
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

    return enterSerial;
  }
  moveTo(surfX: number, surfY: number) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('motion', {
        time: (this.connection as HLConnection).time.getTime(),
        surfaceX: surfX,
        surfaceY: surfY,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  leave(surf: WlSurface) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('leave', {
        serial: (this.connection as HLConnection).serial.next(),
        surface: surf,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  buttonDown(button: number) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('button', {
        serial: (this.connection as HLConnection).serial.next(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.pressed,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  buttonUp(button: number) {
    this.forAll(function (this: SeatAuthority, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('button', {
        serial: (this.connection as HLConnection).serial.next(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.released,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
}

export class WlSeat extends BaseObject {
  info: SeatConfiguration;
  authority: SeatAuthority;

  // latestSerial: number | null = null;

  pointers: Set<WlPointer> = new Set();
  keyboards: Set<WlKeyboard> = new Set();

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: BaseObject, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    this.authority = this.registry!.seatAuthoritiesByName.get(args.name)!;
    this.authority.bind(this);
    this.info = this.authority.config;

    this.addCommand('name', { name: this.info.name });
    this.addCommand('capabilities', { capabilities: this.info.capabilities });
  }

  wlGetPointer({ id: pointer }: { id: WlPointer }) {
    this.pointers.add(pointer);
  }
  wlGetKeyboard({ id: keyboard }: { id: WlKeyboard }) {
    this.keyboards.add(keyboard);
  }

  addCommandToPointers(eventName: string, args: Record<string, any>): void {
    for (const pointer of this.pointers) {
      pointer.addCommand(eventName, args);
    }
  }
  addCommandToKeyboards(eventName: string, args: Record<string, any>): void {
    for (const keyboard of this.keyboards) {
      keyboard.addCommand(eventName, args);
    }
  }
}
