import { setAsap } from "./util/setasap";
import Utils from './util/index';
import { getSelf } from './util/self';
var isNil = Utils.isNil;
var self = getSelf();
if (isNil(self))
    throw new Error('Cannot start system, cannot resolve self');
var conqurSystem = self._conqurInners = self._conqurInners || {
    processes: {},
    messageQueue: [],
    messageQueueIndex: 0,
    errors: {
        byMessageId: {}, byProcessId: {}
    },
    pidCounter: 1,
    midCounter: 1
};
var registerProcess = function (pid, process) {
    conqurSystem.processes[pid] = process;
};
var isProcess = function (pid) {
    return !isNil(conqurSystem.processes[pid]);
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
        setAsap(processEventQueue);
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
// If the process does not exist, the message gets dropped.
var processEventQueue = function () {
    if (!hasMessages())
        return;
    var _a = getNextMessage(), pid = _a.pid, message = _a.message, mid = _a.mid;
    try {
        getProcess(pid).handleCast(message);
    }
    catch (error) {
        // This is not good, because the event queue doesn't get scheduled to run again to completion...
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
export var create = function (process) {
    var result = conqurSystem.pidCounter++;
    process.self = function () { return result; };
    registerProcess(result, process);
    return result;
};
export var destroy = function (pid) {
    if (isProcess(pid)) {
        delete conqurSystem.processes[pid];
    }
    else {
        throw new Error("Cannot destroy a non-existent process: " + pid);
    }
};
export var cast = function (pid, message) {
    if (!isProcess(pid)) {
        throw new Error("Cannot cast a message to a non-existent process: " + pid);
    }
    var mid = conqurSystem.midCounter++;
    queueMessage(pid, mid, message);
    setAsap(processEventQueue);
    return mid;
};
export var call = function (pid, message) {
    if (!isProcess(pid))
        throw new Error("Cannot call a non-existent process: " + pid);
    var process = getProcess(pid);
    return process.handleCall(message);
};
