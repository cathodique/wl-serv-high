import { EventEmitter } from "node:stream";

// TODO: Refactor with Valtio
// https://valtio.dev/

type Key<K, T> = T extends [never] ? string | symbol : K | keyof T;
type Args<K, T> = T extends [never] ? [...args: any[]] : (
  K extends keyof T ? T[K] : never
);
type Listener<K, T, F> = T extends [never] ? F : (
  K extends keyof T ? (
    T[K] extends unknown[] ? (...args: T[K]) => void : never
  )
  : never
);
type Listener1<K, T> = Listener<K, T, (...args: any[]) => void>;
export class EventClient<T extends Record<string, any[]>, U extends Record<string, any[]>> {
  // If someone can type this better I'm all ears
  emitTo: EventEmitter<T>;
  receiveFrom: EventEmitter<U>;

  constructor(emitTo: EventEmitter<T>, receiveFrom: EventEmitter<U>) { this.emitTo = emitTo; this.receiveFrom = receiveFrom; }

  emit<K>(eventName: Key<K, T>, ...args: Args<K, T>): boolean {
    return this.emitTo.emit(eventName, ...args);
  }

  onDestroy: (() => void)[] = [];

  on<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U> {
    this.onDestroy.push((function (this: EventClient<T, U>) { this.receiveFrom.off(eventName, listener); }).bind(this));
    return this.receiveFrom.on(eventName, listener);
  }
  once<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U> {
    this.onDestroy.push((function (this: EventClient<T, U>) { this.receiveFrom.off(eventName, listener); }).bind(this));
    return this.receiveFrom.once(eventName, listener);
  }
  off<K>(eventName: Key<K, U>, listener: Listener1<K, U>): EventEmitter<U> {
    return this.receiveFrom.off(eventName, listener);
  }

  destroy() { this.onDestroy.forEach((callback) => callback()); }
}

export class EventServer<T extends Record<string, any[]>, U extends Record<string, any[]>> extends EventClient<T, U> {
  constructor() {
    super(new EventEmitter<T>(), new EventEmitter<U>());
  }

  createRecipient() { return new EventClient(this.receiveFrom, this.emitTo); }
}
