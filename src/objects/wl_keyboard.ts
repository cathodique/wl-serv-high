import path from "path/posix";
import { BaseObject } from "./base_object.js";

// TODO: Remove dependency on NodeJS fs
import { promises as fsp } from "fs";
import { WlSeat } from "./wl_seat.js";
import { randomUUID } from "crypto";
import { interfaces, NewObjectDescriptor } from "@cathodique/wl-serv-low";
import { SizedFd } from "../misc/utils.js";

interface KeyboardEvents extends Record<string, any[]> {
  keyDown: [WlKeyboard, number];
  keyUp: [WlKeyboard, number];
  modifier: [WlKeyboard, number, number, number, number]; // depressed, latched, locked, group
  focus: [WlKeyboard, number[]]; // keys[]
  blur: [WlKeyboard];
}

// export class KeyboardRegistry {
//   keymapFd: Promise<number>;
//   fileHandle: FileHandle | null = null;
//   size: number | null = null;

//   constructor(v: KeyboardConfiguration) {
//     this.keymapFd = this.loadKeymapFd();
//     this.recipient.on('edit_keymap', (function (this: KeyboardRegistry) {
//       this.keymapFd = this.loadKeymapFd();
//     }).bind(this));
//   }

//   async loadKeymapFd() {
//     this.fileHandle = null;
//     this.size = null;
//     // const keymap = await fsp.readFile(`/usr/share/X11/xkb/symbols/${this.v.keymap}`);
//     const keymap = Buffer.from(`
//       xkb_keymap {
//           xkb_keycodes  { include "evdev+aliases(qwerty)" };
//           xkb_types     { include "complete"      };
//           xkb_compat    { include "complete"      };
//           xkb_symbols   { include "pc+us+inet(evdev)+compose(caps)+terminate(ctrl_alt_bksp)"     };
//           xkb_geometry  { include "pc(pc104)"     };
//       };`);
//     const newFile = path.join(`${process.env.XDG_RUNTIME_DIR || `/tmp/${process.pid}/`}`, `keymap-${randomUUID()}`);
//     await fsp.writeFile(newFile, Buffer.concat([keymap, Buffer.from([0x00])]));
//     this.fileHandle = await fsp.open(newFile, 'r', 0o600);

//     this.size = keymap.length;

//     return this.fileHandle.fd;
//   }
// }

const defaultKeymap = `
  xkb_keymap {
    xkb_keycodes  { include "evdev+aliases(qwerty)" };
    xkb_types     { include "complete"      };
    xkb_compat    { include "complete"      };
    xkb_symbols   { include "pc+us+inet(evdev)+compose(caps)+terminate(ctrl_alt_bksp)"     };
    xkb_geometry  { include "pc(pc104)"     };
  };`;

export class WlKeyboard extends BaseObject<KeyboardEvents> {
  constructor(initCtx: NewObjectDescriptor) {
    // if (conx.registry) return conx.registry;
    super(initCtx);

    if (!(initCtx.parent instanceof WlSeat)) throw new Error('WlPointer needs to be initialized in the scope of a wl_seat');

    this.announceKeymap();
    // const seatRegistry = parent.seatRegistry;

    // this.recipient = seatRegistry.transports.get(conx)!.get(parent.info)!.createRecipient();

    // TODO: Make more customizable (?) => Dont hardcode
    this.addCommand('repeatInfo', {
      rate: 25,
      delay: 600,
    });
  }

  getKeymapFd(keymap: string): Promise<SizedFd> | SizedFd {
    return (async () => {
      // const keymap = await fsp.readFile(`/usr/share/X11/xkb/symbols/${this.v.keymap}`);
      const keymapBuf = Buffer.from(keymap);
      const newFile = path.join(`${process.env.XDG_RUNTIME_DIR || `/tmp/${process.pid}/`}`, `keymap-${randomUUID()}`);
      await fsp.writeFile(newFile, Buffer.concat([keymapBuf, Buffer.from([0x00])]));
      const fileHandle = await fsp.open(newFile, 'r', 0o600);

      return { fd: fileHandle.fd, size: keymapBuf.length };
    })();
  }

  async announceKeymap() {
    const keymap = await this.getKeymapFd(defaultKeymap);
    this.addCommand('keymap', {
      format: interfaces.wl_keyboard.enums.keymapFormat.atoi.xkb_v1,
      size: keymap.size,
      fd: keymap.fd,
    });
  }

  wlDestroy(): void {
    // this.recipient.destroy();

    super.wlDestroy();
  }
}
