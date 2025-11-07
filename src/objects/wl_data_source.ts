import { interfaces } from "@cathodique/wl-serv-low";
import { bitfieldValueToObject } from "../lib/bitfield";
import { BaseObject } from "./base_object";

type Action = "copy" | "move" | "ask";
type NullableAction = Action | "none";

const actionEnum = interfaces["wl_data_device_manager"].enums.dndAction;
const actionMap = new Map(Object.entries(actionEnum.itoa as Record<string, NullableAction>).map(([k, v]) => [+k, v]));

// TODO Finish the implementation - this is not the job of the branch we are currently in
export class WlDataSource extends BaseObject {
  offeredMimeTypes: Set<string> = new Set();
  wlOffer(args: { mimeType: string }) {
    this.offeredMimeTypes.add(args.mimeType);
  }

  actions: Set<Action> = new Set();
  wlSetActions(args: { dndActions: number }) {
    bitfieldValueToObject(actionMap, args.dndActions);
  }
}
