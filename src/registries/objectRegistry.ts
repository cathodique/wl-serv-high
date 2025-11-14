import EventEmitter from "events";
import { HLConnection } from "..";
import { BaseObject } from "../objects/base_object";

// An object registry encapsulates every Authority and their Config
export class ObjectRegistry<Authority, Config> extends EventEmitter<{ 'add': [Config]; 'del': [Config, Authority] }> {
  authorityMap: Map<Config, Authority>;
  constructor(authorityMap: Map<Config, Authority> = new Map()) {
    super();
    this.authorityMap = authorityMap;
  }

  addAuthority(config: Config, authority: Authority) {
    this.authorityMap.set(config, authority);
    this.emit("add", config);
  }
  removeAuthority(config: Config) {
    const authority = this.authorityMap.get(config);
    if (!authority) return;
    this.emit("del", config, authority);
    this.authorityMap.delete(config);
  }

  get(config: Config) {
    return this.authorityMap.get(config);
  }
}

// An object authority encapsulates everything related to a Config, indiscriminately of HLConnection
export class ObjectAuthority<This, Instances, Registry extends ObjectRegistry<This, Config>, Config> {
  config: Config;
  registry: Registry;
  instancesMap: Map<HLConnection, Instances> = new Map();
  constructor(registry: Registry, config: Config) {
    this.config = config;
    this.registry = registry;
  }

  get(conx: HLConnection) {
    return this.instancesMap.get(conx);
  }
  create(conx: HLConnection) {
    throw new Error("Needs to be overridden because JS lacks stuff");
    // return this.instancesMap.set(conx, new ObjectInstances(this, conx));
  }
  delete(conx: HLConnection) {
    return this.instancesMap.delete(conx);
  }
}

// An object instance encapsulates every WlObject in an HLConnection related to a Config
export class ObjectInstances<This, WlObjects extends BaseObject, Authority extends ObjectAuthority<Authority, This, Registry, Config>, Registry extends ObjectRegistry<Authority, Config>, Config> {
  config: Config;
  connection: HLConnection;
  authority: Authority;
  constructor(authority: Authority, conx: HLConnection) {
    this.config = authority.config;
    this.connection = conx;
    this.authority = authority;
  }

  objects: Set<WlObjects> = new Set();
  bind(obj: WlObjects) {
    this.objects.add(obj);
  }

  forAll(fn: (v: WlObjects) => void) {
    for (const obj of this.objects) fn(obj);
  }
}
