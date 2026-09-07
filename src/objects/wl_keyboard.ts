import path from "path/posix";
import { BaseObject } from "./base_object.js";
import { openSync, writeFileSync, unlinkSync, closeSync } from "node:fs";
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

const defaultKeymap = `
  xkb_keymap {
    xkb_keycodes  { include "evdev+aliases(qwerty)" };
    xkb_types     { include "complete"      };
    xkb_compat    { include "complete"      };
    xkb_symbols   { include "pc+us+inet(evdev)+compose(caps)+terminate(ctrl_alt_bksp)"     };
    xkb_geometry  { include "pc(pc104)"     };
  };`;

export class WlKeyboard extends BaseObject<KeyboardEvents> {
  keymapFd?: number;

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

  getKeymapFd(keymap: string): SizedFd {
    const keymapBuf = Buffer.from(keymap);
    const newFile = path.join(`${process.env.XDG_RUNTIME_DIR || `/tmp/${process.pid}/`}`, `keymap-${randomUUID()}`);
    writeFileSync(newFile, Buffer.concat([keymapBuf, Buffer.from([0x00])]));
    const fd = openSync(newFile, 'r', 0o600);
    try {
      unlinkSync(newFile);
    } catch {}

    this.keymapFd = fd;
    return { fd, size: keymapBuf.length + 1 };
  }

  announceKeymap() {
    const keymap = this.getKeymapFd(defaultKeymap);
    this.addCommand('keymap', {
      format: interfaces.wl_keyboard.enums.keymapFormat.atoi.xkb_v1,
      size: keymap.size,
      fd: keymap.fd,
    });
  }

  wlDestroy(): void {
    if (this.keymapFd !== undefined) {
      try {
        closeSync(this.keymapFd);
      } catch {}
      this.keymapFd = undefined;
    }
    super.wlDestroy();
  }
}
