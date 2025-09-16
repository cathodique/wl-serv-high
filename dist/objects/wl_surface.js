"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSurface = void 0;
const base_object_js_1 = require("./base_object.js");
const wl_region_js_1 = require("./wl_region.js");
const doublebuffer_js_1 = require("../lib/doublebuffer.js");
class WlSurface extends base_object_js_1.BaseObject {
    xdgSurface = null;
    daughterSurfaces = new Set();
    subsurface = null;
    opaqueRegions = new doublebuffer_js_1.DoubleBuffer([], this);
    inputRegions = new doublebuffer_js_1.DoubleBuffer([], this);
    surfaceDamage = new doublebuffer_js_1.DoubleBuffer([], this);
    bufferDamage = new doublebuffer_js_1.DoubleBuffer([], this);
    buffer = new doublebuffer_js_1.DoubleBuffer(undefined, this);
    scale = new doublebuffer_js_1.DoubleBuffer(1, this);
    offset = new doublebuffer_js_1.DoubleBuffer([0, 0], this);
    role;
    setRole(role) {
        this.role = role;
        this.emit("updateRole");
    }
    doubleBufferedState = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale, this.surfaceDamage, this.bufferDamage, this.offset]);
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
    }
    outputs = new Set();
    shown(output) {
        const outputAuth = this.connection.display.outputAuthorities.get(output);
        this.outputs.add(outputAuth);
        const dataDevices = this.connection.instances.get('wl_data_device');
        dataDevices?.forEach(function (dataDevice) {
            dataDevice.surfaceFocusCallback.bind(dataDevice);
        }.bind(this));
        outputAuth.forAll(function (wlOutput) {
            this.addCommand('enter', { output: wlOutput });
            this.connection.sendPending();
        }.bind(this));
    }
    wlSetOpaqueRegion(args) {
        this.opaqueRegions.pending = args.region?.instructions;
    }
    wlSetInputRegion(args) {
        this.inputRegions.pending = args.region?.instructions;
    }
    wlOffset({ y, x }) {
        this.offset.pending = [y, x];
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
        if (args.buffer)
            args.buffer.surface = this;
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
        this.bufferDamage.pending = [];
        this.surfaceDamage.pending = [];
        this.buffer.pending = undefined;
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
    }
    wlCommit() {
        console.log('Committing', this.oid);
        this.update();
        this.emit('update');
        if (this.buffer.current) {
            this.buffer.current.addCommand('release', {});
            console.log('Releasing', this.buffer.current.oid);
            this.connection.sendPending();
        }
    }
    wlDamage({ y, x, height, width }) {
        this.surfaceDamage.pending.push(new wl_region_js_1.RegRectangle(wl_region_js_1.InstructionType.Add, y, x, height, width));
    }
    wlDamageBuffer({ y, x, height, width }) {
        this.bufferDamage.pending.push(new wl_region_js_1.RegRectangle(wl_region_js_1.InstructionType.Add, y, x, height, width));
    }
    getCurrlyDammagedBuffer() {
        const surfaceDamageTransformed = this.surfaceDamage.current.map(function (v) {
            return v.copyWithDelta(this.offset.current[0], this.offset.current[1]);
        }.bind(this));
        // Do some kind of algorithm, i guess... to avoid copying the same memory regions multiple times
        // Ill look at that later tho.
        // "Premature optimisation is the root of all evil"
        return [...surfaceDamageTransformed, ...this.bufferDamage.current];
    }
}
exports.WlSurface = WlSurface;
