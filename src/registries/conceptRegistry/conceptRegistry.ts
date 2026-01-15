// A concept registry stores things that are inherently tied to neither objects nor conenections.
// Think of it as a singleton array of things - still per instance of HLCompositor, ofc, so not purely static.

import { EventEmitter } from "node:events";
import { makeRecursiveState } from "../../lib/recursivestate";

export class ConceptRegistry<Config extends Record<string | symbol, any>> extends EventEmitter<{ 'add': [Config]; 'del': [Config], 'change': [any[]] }> {
  configSet: Set<Config>;
  constructor(authorityMap: Set<Config> = new Set()) {
    super();
    this.configSet = authorityMap;
  }

  addConfig(config: Config) {
    this.configSet.add(makeRecursiveState(config, this as EventEmitter<{ "change": [ any[] ] }>));
    this.emit("add", config);
  }
  removeConfig(config: Config) {
    this.emit("del", config);
    this.configSet.delete(config);
  }
}
