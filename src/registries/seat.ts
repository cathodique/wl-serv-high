import { interfaces } from "@cathodique/wl-serv-low";
import { SeatConfiguration, WlSeat } from "../objects/wl_seat.js";
import { ObjectAuthority, ObjectInstances, ObjectRegistry } from "./objectRegistry.js";
import { WlSurface } from "../objects/wl_surface.js";

export class SeatRegistry extends ObjectRegistry<SeatRegistry, SeatAuthority, SeatConfiguration> {
  authorityCtor = SeatAuthority;
}

export class SeatAuthority extends ObjectAuthority<SeatAuthority, SeatInstances, SeatRegistry, SeatConfiguration> {
  instancesCtor = SeatInstances;
}

export class SeatInstances extends ObjectInstances<SeatInstances, WlSeat, SeatAuthority, SeatRegistry, SeatConfiguration> {
  modifiers(dep: number, latch: number, lock: number, group: number, serial?: number) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('modifiers', {
        serial: serial ?? this.connection.serial.next(),
        modsDepressed: dep,
        modsLatched: latch,
        modsLocked: lock,
        group: group,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  focus(surf: WlSurface, keysDown: number[]) {
    const focusSerial = this.connection.serial.next();

    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('enter', {
        serial: focusSerial,
        surface: surf,
        keys: Buffer.from(keysDown),
      });
    }.bind(this));
    this.connection.sendPending();

    return focusSerial;
  }
  blur(surf: WlSurface) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('leave', {
        serial: this.connection.time.getTime(),
        surface: surf,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  keyDown(keyDown: number, isRepeat?: boolean) {
    const keyStateEnum = interfaces.wl_keyboard.enums.keyState.atoi;
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('key', {
        serial: this.connection.serial.next(),
        time: this.connection.time.getTime(),
        key: keyDown - 8,
        state: isRepeat ? keyStateEnum.repeated : keyStateEnum.pressed,
      });
    }.bind(this));
    this.connection.sendPending();
  }
  keyUp(keyUp: number) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToKeyboards('key', {
        serial: this.connection.serial.next(),
        time: this.connection.time.getTime(),
        key: keyUp - 8,
        state: interfaces.wl_keyboard.enums.keymapFormat.atoi.released,
      });
    }.bind(this));
    this.connection.sendPending();
  }

  enter(surf: WlSurface, surfX: number, surfY: number) {
    const enterSerial = this.connection.serial.next();

    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('enter', {
        serial: enterSerial,
        surface: surf,
        surfaceX: surfX,
        surfaceY: surfY,
      });
      wlSeat.addCommandToPointers('frame', {});
      wlSeat.addCommandToPointers('motion', {
        time: this.connection.time.getTime(),
        surfaceX: surfX,
        surfaceY: surfY,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();

    return enterSerial;
  }
  moveTo(surfX: number, surfY: number) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('motion', {
        time: this.connection.time.getTime(),
        surfaceX: surfX,
        surfaceY: surfY,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  leave(surf: WlSurface) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('leave', {
        serial: this.connection.serial.next(),
        surface: surf,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  buttonDown(button: number) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('button', {
        serial: this.connection.serial.next(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.pressed,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
  buttonUp(button: number) {
    this.forAll(function (this: SeatInstances, wlSeat: WlSeat) {
      wlSeat.addCommandToPointers('button', {
        serial: this.connection.serial.next(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.released,
      });
      wlSeat.addCommandToPointers('frame', {});
    }.bind(this));
    this.connection.sendPending();
  }
}
