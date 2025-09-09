"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlKeyboard = exports.KeyboardRegistry = void 0;
const posix_1 = __importDefault(require("path/posix"));
const signalbound_js_1 = require("../lib/signalbound.js");
const base_object_js_1 = require("./base_object.js");
// TODO: Remove dependency on NodeJS fs
const fs_1 = require("fs");
const wl_seat_js_1 = require("./wl_seat.js");
const crypto_1 = require("crypto");
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
class KeyboardRegistry extends signalbound_js_1.Signalbound {
    keymapFd;
    fileHandle = null;
    size = null;
    recipient = this.transport.createRecipient();
    constructor(v) {
        super(v);
        this.keymapFd = this.loadKeymapFd();
        this.recipient.on('edit_keymap', (function () {
            this.keymapFd = this.loadKeymapFd();
        }).bind(this));
    }
    async loadKeymapFd() {
        this.fileHandle = null;
        this.size = null;
        // const keymap = await fsp.readFile(`/usr/share/X11/xkb/symbols/${this.v.keymap}`);
        const keymap = Buffer.from(`
      xkb_keymap {
          xkb_keycodes  { include "evdev+aliases(qwerty)" };
          xkb_types     { include "complete"      };
          xkb_compat    { include "complete"      };
          xkb_symbols   { include "pc+us+inet(evdev)+compose(caps)+terminate(ctrl_alt_bksp)"     };
          xkb_geometry  { include "pc(pc104)"     };
      };`);
        const newFile = posix_1.default.join(`${process.env.XDG_RUNTIME_DIR || `/tmp/${process.pid}/`}`, `keymap-${(0, crypto_1.randomUUID)()}`);
        await fs_1.promises.writeFile(newFile, Buffer.concat([keymap, Buffer.from([0x00])]));
        this.fileHandle = await fs_1.promises.open(newFile, 'r', 0o600);
        this.size = keymap.length;
        return this.fileHandle.fd;
    }
}
exports.KeyboardRegistry = KeyboardRegistry;
class WlKeyboard extends base_object_js_1.BaseObject {
    meta;
    constructor(conx, args, ifaceName, oid, parent, version) {
        // if (conx.registry) return conx.registry;
        super(conx, args, ifaceName, oid, parent, version);
        this.meta = this.connection.hlCompositor.metadata.wl_keyboard;
        if (!(parent instanceof wl_seat_js_1.WlSeat))
            throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');
        this.announceKeymap();
        // const seatRegistry = parent.seatRegistry;
        // this.recipient = seatRegistry.transports.get(conx)!.get(parent.info)!.createRecipient();
        // TODO: Make more customizable (?) => Dont hardcode
        this.addCommand('repeatInfo', {
            rate: 25,
            delay: 600,
        });
    }
    async announceKeymap() {
        const keymapFd = await this.meta.keymapFd;
        // console.log(keymapFd);
        this.addCommand('keymap', {
            format: wl_serv_low_1.interfaces.wl_keyboard.enums.keymapFormat.atoi.xkb_v1,
            size: this.meta.size,
            fd: keymapFd,
        });
    }
    wlDestroy() {
        // this.recipient.destroy();
    }
}
exports.WlKeyboard = WlKeyboard;
