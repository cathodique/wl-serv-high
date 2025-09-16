"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleBuffer = void 0;
const node_stream_1 = require("node:stream");
class DoubleBuffer extends node_stream_1.EventEmitter {
    _current;
    cached;
    pending;
    parent;
    boundRemAllList = this.removeAllListeners.bind(this);
    constructor(v, parent) {
        super();
        this._current = v;
        this.cached = v;
        this.pending = v;
        this.parent = parent;
        parent?.on('beforeWlDestroy', this.boundRemAllList);
    }
    setParent(parent) {
        this.parent?.off('beforeWlDestroy', this.boundRemAllList);
        this.parent = parent;
        parent?.on('beforeWlDestroy', this.boundRemAllList);
    }
    on(name, callback) {
        if (!this.parent)
            throw new Error("Set a parent before using DoubleBuffer.on");
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
exports.DoubleBuffer = DoubleBuffer;
