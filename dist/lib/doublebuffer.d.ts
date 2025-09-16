import { EventEmitter } from "node:stream";
import { BaseObject } from "../objects/base_object";
export declare class DoubleBuffer<T> extends EventEmitter<{
    "current": [T];
}> {
    _current: T;
    cached: T;
    pending: T;
    parent?: BaseObject;
    boundRemAllList: (eventName?: unknown) => this;
    constructor(v: T, parent?: BaseObject);
    setParent(parent?: BaseObject): void;
    on(name: 'current', callback: (v: T) => void): this;
    get current(): T;
    set current(v: T);
}
