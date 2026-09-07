// A concept registry stores things that are inherently tied to neither objects nor conenections.
// Think of it as a singleton array of things - still per instance of HLCompositor, ofc, so not purely static.

import $ from "informa";

export class ConceptRegistry<Config extends Record<string | symbol, any>> extends $.StatifiedSet<Config> {
  constructor(authorityMap: Set<Config> = new Set()) {
    super(authorityMap);
  }
}
