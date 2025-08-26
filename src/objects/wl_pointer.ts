import { Connection, interfaces, ObjectReference } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { SeatEventClient, WlSeat } from "./wl_seat.js";
import { WlSurface } from "./wl_surface.js";
import { HLConnection } from "../index.js";

export class WlPointer extends BaseObject {
  recipient: SeatEventClient;

  latestSerial: number | null = null;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);

    if (!(parent instanceof WlSeat)) throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');

    const seatRegistry = parent.seatRegistry;

    this.recipient = seatRegistry.transports.get(conx)!.get(parent.info)!.createRecipient();

    this.recipient.on('enter', (function (this: WlPointer, enteringSurface: WlSurface, surfX: number, surfY: number) {
      this.addCommand('enter', {
        serial: this.latestSerial = (this.connection as HLConnection).time.getTime(),
        surface: enteringSurface,
        surfaceX: surfX,
        surfaceY: surfY,
      });
      this.addCommand('frame', {});
      this.addCommand('motion', {
        time: (this.connection as HLConnection).time.getTime(),
        surfaceX: surfX,
        surfaceY: surfY,
      });
      this.addCommand('frame', {});
      this.connection.sendPending();
    }).bind(this));
    this.recipient.on('moveTo', (function (this: WlPointer, surfX: number, surfY: number) {
      this.addCommand('motion', {
        time: (this.connection as HLConnection).time.getTime(),
        surfaceX: surfX,
        surfaceY: surfY,
      });
      this.addCommand('frame', {});
      this.connection.sendPending();
    }).bind(this));
    this.recipient.on('leave', (function (this: WlPointer, leavingSurface: WlSurface) {
      this.addCommand('leave', {
        serial: this.latestSerial = this.connection.time.getTime(),
        surface: leavingSurface,
      });
      this.addCommand('frame', {});
      this.connection.sendPending();
    }).bind(this));
    this.recipient.on('buttonDown', (function (this: WlPointer, button: number) {
      this.addCommand('button', {
        serial: this.latestSerial = this.connection.time.getTime(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.pressed,
      });
      this.addCommand('frame', {});
      this.connection.sendPending();
    }).bind(this));
    this.recipient.on('buttonUp', (function (this: WlPointer, button: number) {
      this.addCommand('button', {
        serial: this.latestSerial = this.connection.time.getTime(),
        time: this.connection.time.getTime(),
        button: button,
        state: interfaces.wl_pointer.enums.buttonState.atoi.released,
      });
      this.addCommand('frame', {});
      this.connection.sendPending();
    }).bind(this));
  }
}
