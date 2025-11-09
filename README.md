# wl-serv-high
## High-level, potentially opinionated library to operate a wayland server
<small>Think of it like WlRoots, but without the proper inversion of control</small>

## How to use
```ts
const mySeat = {
  name: "seat0",
  capabilities: 3,
};

const myOutput = {
  x: 0,
  y: 0,
  w: 1920,
  h: 1080,
  effectiveW: 1920,
  effectiveH: 1080,
};

const compo = new HLCompositor({
  wl_registry: {
    outputs: [myOutput],
    seats: [mySeat],
  },
  wl_keyboard: new KeyboardRegistry({ keymap: "us" }),
});

compo.on("connection", (c) => {
  c.on("new_obj", async (obj: BaseObject) => {
    // Object was created
  });
});

compo.start();

compo.on("ready", () => {
  document.body.append(`Ready at ${compo.params.socketPath}`);
});
```
