"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WlCallback = void 0;
const base_object_js_1 = require("./base_object.js");
class WlCallback extends base_object_js_1.BaseObject {
    done(callbackData) {
        this.addCommand('done', { callbackData: callbackData });
        this.wlDestroy();
    }
}
exports.WlCallback = WlCallback;
