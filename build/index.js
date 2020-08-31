"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenServer = exports.call = exports.cast = exports.destroy = exports.create = void 0;
var setasap_1 = require("./util/setasap");
var index_1 = require("./util/index");
var self_1 = require("./util/self");
var self = self_1.getSelf();
if (index_1.isNil(self))
    throw new Error('Cannot start system, cannot resolve self');
var conqurSystem = self._conqurInners = self._conqurInners || {
    processes: {},
    messageQueue: [],
    messageQueueIndex: 0,
    errors: {
        byMessageId: {}, byProcessId: {}
    },
    pidCounter: 0,
    midCounter: 0
};
var registerProcess = function (pid, process) {
    conqurSystem.processes[pid] = process;
};
var isProcess = function (pid) {
    return !index_1.isNil(conqurSystem.processes[pid]);
};
var queueMessage = function (pid, mid, message) {
    conqurSystem.messageQueue.push({ pid: pid, message: message, mid: mid });
};
var hasMessages = function () {
    return conqurSystem.messageQueueIndex < conqurSystem.messageQueue.length;
};
var getNextMessage = function () {
    var message = conqurSystem.messageQueue[conqurSystem.messageQueueIndex];
    conqurSystem.messageQueueIndex++;
    if (conqurSystem.messageQueueIndex == conqurSystem.messageQueue.length) {
        conqurSystem.messageQueue = [];
        conqurSystem.messageQueueIndex = 0;
    }
    else {
        setasap_1.setAsap(processEventQueue);
    }
    return message;
};
var registerError = function (errorPacket) {
    var mid = errorPacket.mid, pid = errorPacket.pid;
    conqurSystem.errors.byMessageId[mid] = errorPacket;
    if (conqurSystem.errors.byProcessId[pid] == null) {
        conqurSystem.errors.byProcessId[pid] = [];
    }
    conqurSystem.errors.byProcessId[pid].push(errorPacket);
};
var processEventQueue = function () {
    if (!hasMessages())
        return;
    var _a = getNextMessage(), pid = _a.pid, message = _a.message, mid = _a.mid;
    if (!isProcess(pid)) {
        throw new Error("Cannot handle a queued message for a non-existent process: " + pid);
    }
    var process = getProcess(pid);
    try {
        process.handleCast(message);
    }
    catch (error) {
        registerError({ message: message, mid: mid, pid: pid, error: error });
        throw error;
    }
};
var getProcess = function (pid) {
    if (!isProcess(pid)) {
        throw new Error("Cannot get a process that does not exist: " + pid);
    }
    return conqurSystem.processes[pid];
};
/**
 * 1. Creates a process from the process definition,
 * 2. Registers the process with the conqer System
 * @returns the process id
 */
exports.create = function (process) {
    var result = conqurSystem.pidCounter++;
    process.self = function () { return result; };
    registerProcess(result, process);
    return result;
};
exports.destroy = function (pid) {
    if (isProcess(pid)) {
        delete conqurSystem.processes[pid];
    }
    else {
        throw new Error("Cannot destroy a non-existent process: " + pid);
    }
};
exports.cast = function (pid, message) {
    if (!isProcess(pid)) {
        throw new Error("Cannot cast a message to a non-existent process: " + pid);
    }
    var mid = conqurSystem.midCounter++;
    queueMessage(pid, mid, message);
    setasap_1.setAsap(processEventQueue);
    return mid;
};
function call(pid, message) {
    if (!isProcess(pid))
        throw new Error("Cannot call a non-existent process: " + pid);
    var process = getProcess(pid);
    return process.handleCall(message);
}
exports.call = call;
;
exports.GenServer = require('./GenServer');
