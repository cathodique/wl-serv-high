export class ObjectAuthority<T, U> {
  config: U;
  constructor(config: U) {
    this.config = config;
  }

  objects: Set<T> = new Set();
  bind(obj: T) {
    this.objects.add(obj);
  }

  forAll(fn: (v: T) => void) {
    for (const obj of this.objects) fn(obj);
  }
}
