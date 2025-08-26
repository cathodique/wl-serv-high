import { WlCallback } from "./wl_callback.js";
import { BaseObject } from "./base_object.js";
export declare class WlDisplay extends BaseObject {
    _version: number;
    wlSync(args: {
        callback: WlCallback;
    }): void;
    wlDestroy(): void;
}
