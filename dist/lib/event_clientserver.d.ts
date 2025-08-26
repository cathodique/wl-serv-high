import { EventEmitter } from "node:stream";
type Key<K, T> = T extends [never] ? string | symbol : K | keyof T;
type Args<K, T> = T extends [never] ? [...args: any[]] : (K extends keyof T ? T[K] : never);
type Listener<K, T, F> = T extends [never] ? F : (K extends keyof T ? (T[K] extends unknown[] ? (...args: T[K]) => void : never) : never);
type Listener1<K, T> = Listener<K, T, (...args: any[]) => void>;
export declare class EventClient<T extends Record<string, any[]>, U extends Record<string, any[]>> {
    emitTo: EventEmitter<T>;
    receiveFrom: EventEmitter<U>;
    constructor(emitTo: EventEmitter<T>, receiveFrom: EventEmitter<U>);
    emit<K>(eventName: Key<K, T>, ...args: Args<K, T>): boolean;
    onDestroy: (() => void)[];
    on<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U>;
    once<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U>;
    off<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U>;
    destroy(): void;
}
export declare class EventServer<T extends Record<string, any[]>, U extends Record<string, any[]>> extends EventClient<T, U> {
    constructor();
    createRecipient(): EventClient<U, T>;
}
export {};
