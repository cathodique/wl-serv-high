"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSurface = void 0;
const base_object_js_1 = require("./base_object.js");
const wl_region_js_1 = require("./wl_region.js");
const doublebuffer_js_1 = require("../lib/doublebuffer.js");
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
class WlSurface extends base_object_js_1.BaseObject {
    xdgSurface = null;
    daughterSurfaces = [];
    subsurface = null;
    opaqueRegions = new doublebuffer_js_1.DoubleBuffer([]);
    inputRegions = new doublebuffer_js_1.DoubleBuffer([]);
    surfaceDamage = new doublebuffer_js_1.DoubleBuffer([]);
    bufferDamage = new doublebuffer_js_1.DoubleBuffer([]);
    buffer = new doublebuffer_js_1.DoubleBuffer(null);
    scale = new doublebuffer_js_1.DoubleBuffer(1);
    offset = new doublebuffer_js_1.DoubleBuffer([0, 0]);
    role;
    setRole(role) {
        this.role = role;
        this.emit("updateRole");
    }
    doubleBufferedState = new Set([this.opaqueRegions, this.inputRegions, this.buffer, this.scale, this.surfaceDamage, this.bufferDamage]);
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.handleMouse();
        this.handleKeyboard();
        this.handleOutput();
    }
    handleMouse() {
        this.on('enter', (function (seatConf, surfX, surfY) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToPointers('enter', {
                    serial: this.connection.serial.next(),
                    surface: this,
                    surfaceX: surfX,
                    surfaceY: surfY,
                });
                wlSeat.addCommandToPointers('frame', {});
                wlSeat.addCommandToPointers('motion', {
                    time: this.connection.time.getTime(),
                    surfaceX: surfX,
                    surfaceY: surfY,
                });
                wlSeat.addCommandToPointers('frame', {});
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('moveTo', (function (seatConf, surfX, surfY) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToPointers('motion', {
                    time: this.connection.time.getTime(),
                    surfaceX: surfX,
                    surfaceY: surfY,
                });
                wlSeat.addCommandToPointers('frame', {});
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('leave', (function (seatConf) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToPointers('leave', {
                    serial: this.connection.serial.next(),
                    surface: this,
                });
                wlSeat.addCommandToPointers('frame', {});
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('buttonDown', (function (seatConf, button) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToPointers('button', {
                    serial: this.connection.serial.next(),
                    time: this.connection.time.getTime(),
                    button: button,
                    state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.pressed,
                });
                wlSeat.addCommandToPointers('frame', {});
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('buttonUp', (function (seatConf, button) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToPointers('button', {
                    serial: this.connection.serial.next(),
                    time: this.connection.time.getTime(),
                    button: button,
                    state: wl_serv_low_1.interfaces.wl_pointer.enums.buttonState.atoi.released,
                });
                wlSeat.addCommandToPointers('frame', {});
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
    }
    output = null;
    handleOutput() {
        this.on('shown', function (output) {
            const outputAuth = this.registry.outputAuthoritiesByConfig.get(output);
            this.output = output;
            outputAuth.forAll(function (wlOutput) {
                this.addCommand('enter', { output: wlOutput });
                this.connection.sendPending();
            }.bind(this));
        }.bind(this));
    }
    handleKeyboard() {
        this.on('modifiers', (function (seatConf, keysDown) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                throw new Error('Not implemented');
                wlSeat.addCommandToKeyboards('modifiers', {
                    serial: this.connection.time.getTime(),
                    surface: this,
                    keys: Buffer.from(keysDown),
                });
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('focus', (function (seatConf, keysDown) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToKeyboards('enter', {
                    serial: this.connection.time.getTime(),
                    surface: this,
                    keys: Buffer.from(keysDown),
                });
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('blur', (function (seatConf) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToKeyboards('leave', {
                    serial: this.connection.time.getTime(),
                    surface: this,
                });
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('keyDown', (function (seatConf, keyDown, isRepeat) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            const keyStateEnum = wl_serv_low_1.interfaces.wl_keyboard.enums.keyState.atoi;
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToKeyboards('key', {
                    serial: this.connection.serial.next(),
                    time: this.connection.time.getTime(),
                    key: keyDown - 8,
                    state: isRepeat ? keyStateEnum.repeated : keyStateEnum.pressed,
                });
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
        this.on('keyUp', (function (seatConf, keyUp) {
            const seatAuth = this.registry.seatAuthoritiesByConfig.get(seatConf);
            seatAuth.forAll(function (wlSeat) {
                wlSeat.addCommandToKeyboards('key', {
                    serial: this.connection.serial.next(),
                    time: this.connection.time.getTime(),
                    key: keyUp - 8,
                    state: wl_serv_low_1.interfaces.wl_keyboard.enums.keymapFormat.atoi.released,
                });
            }.bind(this));
            this.connection.sendPending();
        }).bind(this));
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
        this.buffer.pending = null;
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
