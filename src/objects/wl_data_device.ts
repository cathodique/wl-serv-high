import { BaseObject } from "./base_object.js";
import { WlSeat } from "./wl_seat.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { fromServer } from "../misc/fromServerSymbol.js";
import { HLConnection } from "../index.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { WlSurface } from "./wl_surface.js";

export class WlDataDevice extends BaseObject {
  seat: WlSeat;
  // recipient: SeatEventClient;

  constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number) {
    super(conx, args, ifaceName, oid, parent, version);
    this.seat = args.seat;

    // this.recipient = this.seat.seatRegistry.transports.get(conx)!.get(this.seat.info)!.createRecipient();

    this.connection.instances.get('wl_surface')?.forEach(function (this: WlDataDevice, v: BaseObject) {
      const surf = v as WlSurface;

      surf.on('focus', function (this: WlDataDevice, kbd: WlKeyboard) {
        const newOid = this.connection.createServerOid();
        this.addCommand('dataOffer', { id: { oid: newOid } });

        const newKidOid = conx.createObjRef({ mimeType: 'text/plain;charset=utf-8', [fromServer]: true }, 'wl_data_offer', newOid, this);
        conx.createObject(newKidOid);
        this.addCommand('selection', { id: null });
      }.bind(this));

    }.bind(this));
  }
}
