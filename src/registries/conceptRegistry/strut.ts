// A strut blocks XDG popups.

import { ConceptRegistry } from "./conceptRegistry";

export interface StrutConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class StrutRegistry extends ConceptRegistry<StrutConfig> {}
