import { HLConnection } from "..";

export class ObjectAuthority<T, U> {
  config: U;
  connection: HLConnection;
  constructor(config: U, conx: HLConnection) {
    this.config = config;
    this.connection = conx;
  }

  objects: Set<T> = new Set();
  bind(obj: T) {
    this.objects.add(obj);
  }

  forAll(fn: (v: T) => void) {
    for (const obj of this.objects) fn(obj);
  }
}
