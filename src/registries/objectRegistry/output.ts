import { WlOutput } from "../../objects/wl_output.js";
import { ObjectAuthority, ObjectInstances, ObjectRegistry } from "./objectRegistry.js";

export interface OutputConfiguration {
  x: number;
  y: number;
  w: number;
  h: number;
  effectiveW: number;
  effectiveH: number;
}

export class OutputRegistry extends ObjectRegistry<OutputRegistry, OutputAuthority, OutputConfiguration> {
  authorityCtor = OutputAuthority;
}

export class OutputAuthority extends ObjectAuthority<OutputAuthority, OutputInstances, OutputRegistry, OutputConfiguration> {
  instancesCtor = OutputInstances;
}

export class OutputInstances extends ObjectInstances<OutputInstances, WlOutput, OutputAuthority, OutputRegistry, OutputConfiguration> {}
