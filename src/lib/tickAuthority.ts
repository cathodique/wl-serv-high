import { EventEmitter } from "node:stream";

export class TickAuthority extends EventEmitter<{ tick: [] }> { }
