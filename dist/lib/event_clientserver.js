"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventServer = exports.EventClient = void 0;
const node_stream_1 = require("node:stream");
class EventClient {
    // If someone can type this better I'm all ears
    emitTo;
    receiveFrom;
    constructor(emitTo, receiveFrom) { this.emitTo = emitTo; this.receiveFrom = receiveFrom; }
    emit(eventName, ...args) {
        return this.emitTo.emit(eventName, ...args);
    }
    onDestroy = [];
    on(eventName, listener) {
        this.onDestroy.push((function () { this.receiveFrom.off(eventName, listener); }).bind(this));
        return this.receiveFrom.on(eventName, listener);
    }
    once(eventName, listener) {
        this.onDestroy.push((function () { this.receiveFrom.off(eventName, listener); }).bind(this));
        return this.receiveFrom.once(eventName, listener);
    }
    off(eventName, listener) {
        return this.receiveFrom.off(eventName, listener);
    }
    destroy() { this.onDestroy.forEach((callback) => callback()); }
}
exports.EventClient = EventClient;
class EventServer extends EventClient {
    constructor() {
        super(new node_stream_1.EventEmitter(), new node_stream_1.EventEmitter());
    }
    createRecipient() { return new EventClient(this.receiveFrom, this.emitTo); }
}
exports.EventServer = EventServer;
