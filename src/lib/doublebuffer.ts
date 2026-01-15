import { EventEmitter } from "node:stream";
import { BaseObject } from "../objects/base_object.js";

export class DoubleBuffer<T> extends EventEmitter<{ "current": [T] }> {
  _current: T;
  cached: T;
  pending: T;

  parent?: BaseObject;

  boundRemAllList = this.removeAllListeners.bind(this);

  constructor(v: T, parent?: BaseObject) {
    super();
    this._current = v;
    this.cached = v;
    this.pending = v;

    this.parent = parent;

    parent?.on('beforeWlDestroy', this.boundRemAllList);
  }

  setParent(parent?: BaseObject) {
    this.parent?.off('beforeWlDestroy', this.boundRemAllList);

    this.parent = parent;

    parent?.on('beforeWlDestroy', this.boundRemAllList);
  }

  on(name: 'current', callback: (v: T) => void) {
    if (!this.parent) throw new Error("Set a parent before using DoubleBuffer.on");
    super.on(name, callback);

    return this;
  }

  get current() {
    return this._current;
  }
  set current(v) {
    this.emit('current', v);
    this._current = v;
  }
}
