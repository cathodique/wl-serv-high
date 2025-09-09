"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XdgPositioner = void 0;
const wl_serv_low_1 = require("@cathodique/wl-serv-low");
const base_object_js_1 = require("./base_object.js");
const bitfield_js_1 = require("../lib/bitfield.js");
const directionsAndCorners = ["top", "bottom", "left", "right", "top_left", "bottom_left", "top_right", "bottom_right"];
const dirsAndCornsAndNone = [...directionsAndCorners, "none"];
const optimizedFlip = {
    "none": "none",
    "top": "bottom",
    "bottom": "top",
    "left": "right",
    "right": "left",
    "top_left": "bottom_right",
    "bottom_left": "top_right",
    "top_right": "bottom_left",
    "bottom_right": "top_left",
};
const cstrAdjEnum = wl_serv_low_1.interfaces["xdg_positioner"].enums.constraintAdjustment;
const caMap = new Map(Object.entries(cstrAdjEnum.itoa).map(([k, v]) => [+k, v]));
const name = 'xdg_positioner';
class XdgPositioner extends base_object_js_1.BaseObject {
    size; // YX
    wlSetSize({ height, width }) {
        if (height <= 0)
            return;
        this.size = [height, width];
    }
    anchorPos; // YX
    anchorSize; // YX
    wlSetAnchorRect({ y, x, height, width }) {
        this.anchorPos = [y, x];
        this.anchorSize = [height, width];
    }
    anchor;
    wlSetAnchor({ anchor }) {
        const fullAnchor = wl_serv_low_1.interfaces['xdg_positioner'].enums.anchor.itoa[anchor];
        this.anchor = fullAnchor; // I dont think theyre gonna change it lol
    }
    gravity;
    wlSetGravity({ anchor }) {
        const fullGravity = wl_serv_low_1.interfaces['xdg_positioner'].enums.gravity.itoa[anchor];
        this.gravity = fullGravity; // I dont think theyre gonna change it lol
    }
    reactive = false;
    wlSetReactive() {
        this.reactive = true;
    }
    offset = [0, 0]; // YX also OH COME ON.
    wlSetOffset({ y, x }) {
        this.offset = [y, x];
    }
    constraintAdjustment;
    wlSetConstraintAdjustment({ constraintAdjustment }) {
        this.constraintAdjustment = (0, bitfield_js_1.bitfieldValueToObject)(caMap, constraintAdjustment);
    }
    static isComplete(that) {
        if (!(that.size?.every((v) => v > 0)))
            return false;
        if (!(that.anchorSize?.every((v) => v >= 0)))
            return false;
        return true;
    }
    anchorPoint(theoryAnchor) {
        if (!XdgPositioner.isComplete(this))
            throw new Error("Indeterminate.");
        let anchor = [this.offset[0] + this.anchorPos[0], this.offset[1] + this.anchorPos[1]];
        switch (theoryAnchor || this.anchor) {
            case "top_left":
            case "bottom_left":
                // X is null-W
                anchor[1] += 0;
                break;
            case "top":
            case "bottom":
                // X is half-W
                anchor[1] += this.anchorSize[1] / 2;
                break;
            case "top_right":
            case "bottom_right":
                // X is full-W
                anchor[1] += this.anchorSize[1];
                break;
        }
        switch (this.anchor) {
            case "top_left":
            case "top_right":
                // Y is null-H
                anchor[0] += 0;
                break;
            case "left":
            case "right":
                // Y is half-H
                anchor[0] += this.anchorSize[0] / 2;
                break;
            case "bottom_left":
            case "bottom_right":
                // Y is full-H
                anchor[0] += this.anchorSize[0];
                break;
        }
        return anchor;
    }
    // unboundedPosition(theoryAnchor?: typeof dirsAndCornsAndNone[number], theoryGravity?: typeof dirsAndCornsAndNone[number]) {
    //   const from = this.anchorPoint(theoryAnchor);
    //   switch (theoryGravity || this.gravity) {
    //     case ""
    //   }
    // }
    positionInBox([y, x], [contH, contW]) {
        if (!XdgPositioner.isComplete(this))
            throw new Error("Indeterminate.");
        let [h, w] = this.size;
        const anchorPoint = this.anchorPoint();
    }
    // "The compositor may use this information together with set_parent_size to determine what future state the popup should be constrained using."
    // Nah, im good.
    get complete() {
        return XdgPositioner.isComplete(this);
    }
}
exports.XdgPositioner = XdgPositioner;
