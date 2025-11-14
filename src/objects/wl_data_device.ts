import { BaseObject } from "./base_object.js";
import { WlSeat } from "./wl_seat.js";
import { NewObjectDescriptor, ObjectReference } from "@cathodique/wl-serv-low";
import { WlKeyboard } from "./wl_keyboard.js";
import { WlSurface } from "./wl_surface.js";
import { WlDataOffer } from "./wl_data_offer.js";

export class WlDataDevice extends BaseObject {
  seat: WlSeat;
  // recipient: SeatEventClient;

  onDestroy: (() => void)[] = [];

  constructor(initCtx: NewObjectDescriptor, seat: WlSeat) {
    super(initCtx);

    this.seat = seat;

    // this.recipient = this.seat.seatRegistry.transports.get(conx)!.get(this.seat.info)!.createRecipient();

    this.connection.instances.get('wl_surface')?.forEach(function (this: WlDataDevice, v: BaseObject) {
      const surf = v as WlSurface;

      const cb = this.surfaceFocusCallback.bind(this);

      surf.on('shown', cb);

      this.onDestroy.push(() => {
        surf.off('shown', cb);
      });
    }.bind(this));
  }

  surfaceFocusCallback(kbd: WlKeyboard) {
    const newOid = this.connection.createServerOid();
    this.addCommand('dataOffer', { id: { oid: newOid } });

    const newKidOid = new WlDataOffer(
      {
        oid: newOid,
        type: 'wl_data_offer',
        parent: this,
        connection: this.connection,
      },
      { mimeType: 'text/plain;charset=utf-8' },
    );
    this.connection.createObject(newKidOid);
    this.addCommand('selection', { id: newKidOid });
  }
}
