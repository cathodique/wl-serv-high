import { EventClient, EventServer } from "../lib/event_clientserver.js";
import { Signalbound } from "../lib/signalbound.js";
import { BaseObject } from "./base_object.js";
import { FileHandle } from "fs/promises";
import { SeatEventClient } from "./wl_seat.js";
import { ObjectReference } from "@cathodique/wl-serv-low";
import { HLConnection } from "../index.js";
type KeyboardServerToClient = {
    'edit_keymap': [];
};
export type KeyboardEventServer = EventServer<KeyboardServerToClient, {}>;
export type KeyboardEventClient = EventClient<{}, KeyboardServerToClient>;
interface KeyboardConfiguration {
    keymap: string;
}
export declare class KeyboardRegistry extends Signalbound<KeyboardConfiguration, KeyboardEventServer> {
    keymapFd: Promise<number>;
    fileHandle: FileHandle | null;
    size: number | null;
    recipient: EventClient<{}, KeyboardServerToClient>;
    constructor(v: KeyboardConfiguration);
    loadKeymapFd(): Promise<number>;
}
export type WlKeyboardMetadata = KeyboardRegistry;
export declare class WlKeyboard extends BaseObject {
    recipient: SeatEventClient;
    meta: KeyboardRegistry;
    constructor(conx: HLConnection, args: Record<string, any>, ifaceName: string, oid: number, parent?: ObjectReference, version?: number);
    announceKeymap(): Promise<void>;
}
export {};
