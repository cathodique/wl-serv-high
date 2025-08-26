import { EventServer } from "./event_clientserver";
export declare class Signalbound<T, U extends EventServer<Record<string, any[]>, Record<string, any[]>>> {
    get iface(): string;
    v: T;
    transport: U;
    constructor(v: T);
}
