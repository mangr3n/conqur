"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenServer = void 0;
var util_1 = require("./util");
var core_1 = require("./core");
var isNil = util_1.default.isNil;
;
var GenServer = function (_a) {
    var name = _a.name, castHandlers = _a.castHandlers, callHandlers = _a.callHandlers, initialState = _a.initialState;
    var state = initialState;
    var me = null;
    var self = function () { return me; };
    function handleCall(msg) {
        var type = msg.type;
        if (isNil(callHandlers[type])) {
            throw new Error("Unknown call message type '" + type + "'");
        }
        else {
            var handler = callHandlers[type];
            return handler(self, state, msg);
        }
    }
    var processDef = {
        name: name,
        self: self,
        handleCast: function (msg) {
            var type = msg.type;
            if (isNil(castHandlers[type])) {
                throw new Error("Unknown cast message type '" + type + "'");
            }
            else {
                var handler = castHandlers[type];
                state = handler(self, state, msg);
                if (msg.done)
                    msg.done();
            }
        },
        handleCall: handleCall
    };
    me = core_1.create(processDef);
    return me;
};
exports.GenServer = GenServer;
