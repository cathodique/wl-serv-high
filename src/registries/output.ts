import { HLConnection } from "..";
import { OutputConfiguration, WlOutput } from "../objects/wl_output";
import { ObjectAuthority, ObjectInstances, ObjectRegistry } from "./objectRegistry";

export class OutputRegistry extends ObjectRegistry<OutputRegistry, OutputAuthority, OutputConfiguration> {
  authorityCtor = OutputAuthority;
}

export class OutputAuthority extends ObjectAuthority<OutputAuthority, OutputInstances, OutputRegistry, OutputConfiguration> {
  instancesCtor = OutputInstances;
}

export class OutputInstances extends ObjectInstances<OutputInstances, WlOutput, OutputAuthority, OutputRegistry, OutputConfiguration> {}
