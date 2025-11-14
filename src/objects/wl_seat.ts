import { BaseObject } from "./base_object.js";
import { WlPointer } from "./wl_pointer.js";
import { WlKeyboard } from "./wl_keyboard.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { SeatInstances } from "../registries/seat.js";

export interface SeatConfiguration {
  name: string;
  capabilities: number;
}

export class WlSeat extends BaseObject {
  info: SeatConfiguration;
  seatInstances: SeatInstances;

  pointers: Set<WlPointer> = new Set();
  keyboards: Set<WlKeyboard> = new Set();

  constructor(initCtx: NewObjectDescriptor, seatName: number) {
    super(initCtx);

    this.info = this.registry!.seatConfigByName.get(seatName)!;

    const seatAuthority = this.registry!.seatRegistry.get(this.info)!;
    this.seatInstances = seatAuthority.get(this.connection)!;

    this.seatInstances.bind(this);
    this.info = this.seatInstances.config;

    this.addCommand('name', { name: this.info.name });
    this.addCommand('capabilities', { capabilities: this.info.capabilities });
  }

  wlGetPointer({ id }: { id: NewObjectDescriptor }) {
    const pointer = new WlPointer(id);
    this.connection.createObject(pointer);
    this.pointers.add(pointer);
  }
  wlGetKeyboard({ id }: { id: NewObjectDescriptor }) {
    const keyboard = new WlKeyboard(id);
    this.connection.createObject(keyboard);
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
