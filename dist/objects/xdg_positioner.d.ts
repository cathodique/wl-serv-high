import { BaseObject } from "./base_object.js";
declare const dirsAndCornsAndNone: readonly ["top", "bottom", "left", "right", "top_left", "bottom_left", "top_right", "bottom_right", "none"];
type ConstraintAdjustments = "flip_x" | "flip_y" | "slide_x" | "slide_y" | "scale_x" | "scale_y";
export declare class XdgPositioner extends BaseObject {
    size?: [number, number];
    wlSetSize({ height, width }: {
        height: number;
        width: number;
    }): void;
    anchorPos?: [number, number];
    anchorSize?: [number, number];
    wlSetAnchorRect({ y, x, height, width }: {
        y: number;
        x: number;
        height: number;
        width: number;
    }): void;
    anchor?: typeof dirsAndCornsAndNone[number];
    wlSetAnchor({ anchor }: {
        anchor: number;
    }): void;
    gravity?: typeof dirsAndCornsAndNone[number];
    wlSetGravity({ anchor }: {
        anchor: number;
    }): void;
    reactive: boolean;
    wlSetReactive(): void;
    offset: [number, number];
    wlSetOffset({ y, x }: {
        y: number;
        x: number;
    }): void;
    constraintAdjustment?: Set<ConstraintAdjustments>;
    wlSetConstraintAdjustment({ constraintAdjustment }: {
        constraintAdjustment: number;
    }): void;
    private static isComplete;
    anchorPoint(theoryAnchor?: typeof dirsAndCornsAndNone[number]): [number, number];
    positionInBox([y, x]: [number, number], [contH, contW]: [number, number]): void;
    get complete(): boolean;
}
export {};
