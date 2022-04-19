import { setAsap } from './util/setasap';
import Utils from './util/index';
import { getSelf } from './util/self';
import { Process, ProcessID } from './types';
const { isNil } = Utils;
const self = getSelf();

if (isNil(self)) throw new Error('Cannot start system, cannot resolve self');

const conqurSystem = ((self as any)._conqurInners = (self as any)._conqurInners || {
  processes: {},
  messageQueue: [],
  messageQueueIndex: 0,
  errors: {
    byMessageId: {},
    byProcessId: {},
  },
  pidCounter: 1,
  midCounter: 1,
});

const registerProcess = (pid: ProcessID, process: Process) => {
  conqurSystem.processes[pid] = process;
};

const isProcess = (pid: ProcessID) => {
  return !isNil(conqurSystem.processes[pid]);
};

const queueMessage = (pid: ProcessID, mid: number, message: any) => {
  conqurSystem.messageQueue.push({ pid, message, mid });
};

const hasMessages = () => {
  return conqurSystem.messageQueueIndex < conqurSystem.messageQueue.length;
};

const getNextMessage = () => {
  const message = conqurSystem.messageQueue[conqurSystem.messageQueueIndex];
  conqurSystem.messageQueueIndex++;
  if (conqurSystem.messageQueueIndex === conqurSystem.messageQueue.length) {
    conqurSystem.messageQueue = [];
    conqurSystem.messageQueueIndex = 0;
  } else {
    setAsap(processEventQueue);
  }
  return message;
};

const registerError = (errorPacket: any) => {
  const { mid, pid } = errorPacket;
  conqurSystem.errors.byMessageId[mid] = errorPacket;
  if (conqurSystem.errors.byProcessId[pid] == null) {
    conqurSystem.errors.byProcessId[pid] = [];
  }
  conqurSystem.errors.byProcessId[pid].push(errorPacket);
};

// If the process does not exist, the message gets dropped.
const processEventQueue = () => {
  if (!hasMessages()) return;
  const { pid, message, mid } = getNextMessage();
  try {
    getProcess(pid).handleCast(message);
  } catch (error) {
    // This is not good, because the event queue doesn't get scheduled to run again to completion...
    registerError({ message, mid, pid, error });
    throw error;
  }
};

const getProcess = (pid: ProcessID) => {
  if (!isProcess(pid)) {
    throw new Error(`Cannot get a process that does not exist: ${pid}`);
  }
  return conqurSystem.processes[pid];
};

/**
 * 1. Creates a process from the process definition,
 * 2. Registers the process with the conqer System
 * @returns the process id
 */
export const create = (process: Process) => {
  const result = conqurSystem.pidCounter++;
  process.self = () => result;
  registerProcess(result, process);
  return result;
};

export const destroy = (pid: number) => {
  if (isProcess(pid)) {
    delete conqurSystem.processes[pid];
  } else {
    throw new Error(`Cannot destroy a non-existent process: ${pid}`);
  }
};

export const cast = (pid: ProcessID, message: any) => {
  if (!isProcess(pid)) {
    throw new Error(`Cannot cast a message to a non-existent process: ${pid}`);
  }
  const mid = conqurSystem.midCounter++;
  queueMessage(pid, mid, message);
  setAsap(processEventQueue);
  return mid;
};

export const call = (pid: number, message: any) => {
  if (!isProcess(pid)) throw new Error(`Cannot call a non-existent process: ${pid}`);
  const process = getProcess(pid);
  return process.handleCall(message);
};
