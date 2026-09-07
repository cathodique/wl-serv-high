import $ from "informa";
import { HLConnection } from "../../index.js";
import { BaseObject } from "../../objects/base_object.js";

// An object registry encapsulates every Authority and their Config
export class ObjectRegistry<This, Authority, Config> extends $.StatifiedMap<Config, Authority> {
  constructor(authorityMap: Map<Config, Authority> = new Map()) {
    super(authorityMap);
  }

  authorityCtor: new (registry: This, config: Config) => Authority = null as unknown as new (registry: This, config: Config) => Authority;
  addAuthority(config: Config) {
    this.set(config, new this.authorityCtor(this as unknown as This, config));
  }
  removeAuthority(config: Config) {
    const authority = this.get(config);
    if (!authority) return;
    this.delete(config);
  }
}

// An object authority encapsulates everything related to a Config, indiscriminately of HLConnection
export class ObjectAuthority<This, Instances, Registry extends ObjectRegistry<Registry, This, Config>, Config> {
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
  instancesCtor: new (auth: This, conx: HLConnection) => Instances = null as unknown as new (auth: This, config: HLConnection) => Instances;
  createInstances(conx: HLConnection) {
    return this.instancesMap.set(conx, new this.instancesCtor(this as unknown as This, conx));
  }
  delete(conx: HLConnection) {
    return this.instancesMap.delete(conx);
  }
}

// An object instance encapsulates every WlObject in an HLConnection related to a Config
export class ObjectInstances<This, WlObjects extends BaseObject, Authority extends ObjectAuthority<Authority, This, Registry, Config>, Registry extends ObjectRegistry<Registry, Authority, Config>, Config> {
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
