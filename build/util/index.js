"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNil = void 0;
exports.isNil = function (v) {
    if (v === undefined)
        return true;
    if (v === null)
        return true;
    return false;
};
