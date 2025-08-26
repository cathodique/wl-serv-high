import { BaseObject } from "./base_object.js";

export class WlCallback extends BaseObject {
  done(callbackData: number) {
    this.addCommand('done', { callbackData: callbackData });
    this.wlDestroy();
  }
}
