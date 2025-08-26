"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSurface = void 0;
const base_object_js_1 = require("./base_object.js");
const doublebuffer_js_1 = require("../lib/doublebuffer.js");
class WlSurface extends base_object_js_1.BaseObject {
    xdgSurface = null;
    daughterSurfaces = [];
    subsurface = null;
    opaqueRegions = new doublebuffer_js_1.DoubleBuffer([]);
    inputRegions = new doublebuffer_js_1.DoubleBuffer([]);
    buffer = new doublebuffer_js_1.DoubleBuffer(null);
    scale = new doublebuffer_js_1.DoubleBuffer(1);
    doubleBufferedState = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale]);
    surfaceToBufferDelta = [0, 0];
    wlSetOpaqueRegion(args) {
        this.opaqueRegions.pending = args.region?.instructions;
    }
    wlSetInputRegion(args) {
        this.inputRegions.pending = args.region?.instructions;
    }
    wlFrame({ callback }) {
        this.connection.hlCompositor.ticks.once('tick', (function () {
            callback.done(this.connection.time.getTime());
            this.connection.sendPending();
        }).bind(this));
    }
    wlSetBufferScale(args) {
        this.scale.pending = args.scale;
    }
    wlAttach(args) {
        this.buffer.pending = args.buffer;
    }
    get synced() {
        if (!this.subsurface)
            return false;
        return this.subsurface.isSynced || this.subsurface.assocParent.synced;
    }
    update() {
        for (const doubleBuffed of this.doubleBufferedState) {
            doubleBuffed.cached = doubleBuffed.pending;
        }
        if (!this.subsurface)
            this.applyCache();
        if (this.subsurface && !this.subsurface.isSynced)
            this.applyCache();
    }
    applyCache() {
        this.daughterSurfaces.forEach((surf) => surf.applyCache());
        for (const doubleBuffed of this.doubleBufferedState) {
            // if (doubleBuffed.current instanceof WlBuffer && doubleBuffed.current !== doubleBuffed.cached) doubleBuffed.current.wlRelease();
            doubleBuffed.current = doubleBuffed.cached;
        }
        this.buffer.pending = null;
    }
    wlCommit() {
        this.update();
        this.emit('update');
        if (this.buffer.current) {
            this.buffer.current.addCommand('release', {});
        }
    }
}
exports.WlSurface = WlSurface;
