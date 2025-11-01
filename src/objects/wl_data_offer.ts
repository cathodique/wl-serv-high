import { BaseObject } from "./base_object.js";
import { NewObjectDescriptor } from "@cathodique/wl-serv-low";

export class WlDataOffer extends BaseObject {
  constructor(initCtx: NewObjectDescriptor, args: { mimeType: string }) {
    super(initCtx);

    this.addCommand('offer', { mimeType: args.mimeType });
  }
}
