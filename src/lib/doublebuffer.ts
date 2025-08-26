export class DoubleBuffer<T> {
  current: T;
  cached: T;
  pending: T;
  constructor(v: T) {
    this.current = v;
    this.cached = v;
    this.pending = v;
  }
}
