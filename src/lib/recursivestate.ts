import EventEmitter from "node:events";

export type ChangePath = any[];

interface RecursiveStateContext {
  events: EventEmitter<{ "change": [ ChangePath ] }>;
  path: ChangePath; // TODO: Regex for arrays
}

export class ProxyMap<K, V> extends Map<K, V> {
  #recursiveStateContext: RecursiveStateContext;
  constructor(ctx: RecursiveStateContext, ...args: ConstructorParameters<typeof Map<K, V>>) {
    super(...args);
    this.#recursiveStateContext = ctx;
  }

  #changed() {
    this.#recursiveStateContext.events.emit("change", this.#recursiveStateContext.path);
  }

  set(key: K, value: V) {
    this.#changed();
    return super.set(key, value);
  }
  delete(key: K) {
    this.#changed();
    return super.delete(key);
  }
}

export class ProxySet<V> extends Set<V> {
  #recursiveStateContext: RecursiveStateContext;
  constructor(ctx: RecursiveStateContext, ...args: ConstructorParameters<typeof Set<V>>) {
    super(...args);
    this.#recursiveStateContext = ctx;
  }

  #changed() {
    this.#recursiveStateContext.events.emit("change", this.#recursiveStateContext.path);
  }

  add(value: V) {
    this.#changed();
    return super.add(value);
  }
  delete(val: V) {
    this.#changed();
    return super.delete(val);
  }
  clear() {
    return super.clear();
  }
}

export function makeRecursiveState<T extends any[] | Record<string|symbol, any> | Set<any> | Map<any, any>>
(
  original: T,
  ctxOrEvtEmitter: RecursiveStateContext
    | EventEmitter<{ "change": [ ChangePath ] }>,
): T {
  const events = ctxOrEvtEmitter instanceof EventEmitter ? ctxOrEvtEmitter : ctxOrEvtEmitter.events;
  const path = ctxOrEvtEmitter instanceof EventEmitter ? [] : ctxOrEvtEmitter.path;

  const ctx = { events, path };

  if (original instanceof Map) return new ProxyMap(ctx, original) as Map<any, any> as T;
  if (original instanceof Set) return new ProxySet(ctx, original) as Set<any> as T;

  return new Proxy(original as (any[] | Record<string|symbol, any>), {
    get(target, prop) {
      const result = (() => {
        if (Array.isArray(target)) return target[+(prop as string)];
        return target[prop];
      })();

      if (typeof result === 'object') {
        return makeRecursiveState(result, {
          path: [...path, prop],
          events,
        });
      } else {
        return result;
      }
    },
    set(target, prop, value) {
      try {
        if (Array.isArray(target)) target[+(prop as string)] = value;
        else target[prop] = value
        events.emit("change", path);
        return true;
      } catch (err) {
        return false;
      }
    }
  }) as T;
}
