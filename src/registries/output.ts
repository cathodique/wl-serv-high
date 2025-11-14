import { HLConnection } from "..";
import { OutputConfiguration, WlOutput } from "../objects/wl_output";
import { ObjectAuthority, ObjectInstances, ObjectRegistry } from "./objectRegistry";

export class OutputRegistry extends ObjectRegistry<OutputAuthority, OutputConfiguration> {}

export class OutputAuthority extends ObjectAuthority<OutputAuthority, OutputInstances, OutputRegistry, OutputConfiguration> {
  create(conx: HLConnection) {
    return this.instancesMap.set(conx, new OutputInstances(this, conx));
  }
}

export class OutputInstances extends ObjectInstances<OutputInstances, WlOutput, OutputAuthority, OutputRegistry, OutputConfiguration> {}
