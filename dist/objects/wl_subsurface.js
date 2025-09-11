"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlSubsurface = void 0;
const base_object_js_1 = require("./base_object.js");
class WlSubsurface extends base_object_js_1.BaseObject {
    assocSurface;
    assocParent;
    isSynced;
    constructor(conx, args, ifaceName, oid, parent, version) {
        super(conx, args, ifaceName, oid, parent, version);
        this.assocSurface = args.surface;
        this.assocSurface.subsurface = this;
        this.isSynced = true;
        this.assocParent = args.parent;
        args.parent.daughterSurfaces.add(args.surface);
        this.assocSurface.setRole("subsurface");
    }
    wlSetDesync() { this.isSynced = false; }
    wlSetSync() { this.isSynced = true; }
    getRelationWith(surf) {
        if (this.assocSurface === surf)
            return "parent";
        if (this.assocParent.daughterSurfaces.has(surf))
            return "sibling";
        return "not_directly_related";
    }
    wlSetPosition(args) { console.log(args); }
}
exports.WlSubsurface = WlSubsurface;
