// const serialData = {
//   "xdg_serial": {

//   },
// } as const;

// class Serial {}

// class XdgSerial extends Serial {}

export class SerialAuthority {
  currentSerial = 0;
  next() {
    return this.currentSerial++;
  }

  // serialMap: Map<number, Serial> = new Map();
}
