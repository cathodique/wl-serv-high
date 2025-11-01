import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { BaseObject } from "./base_object.js";
import { WlSeat } from "./wl_seat.js";
import { WlDataDevice } from "./wl_data_device.js";
import { WlDataSource } from "./wl_data_source.js";

export class WlDataDeviceManager extends BaseObject {
  wlCreateDataSource(args: { id: NewObjectDescriptor }) {
    this.connection.createObject(new WlDataSource(args.id));
  }
  wlGetDataDevice(args: { id: NewObjectDescriptor, seat: WlSeat }) {
    this.connection.createObject(new WlDataDevice(args.id, args.seat));
  }
}
