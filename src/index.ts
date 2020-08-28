import { setAsap } from "./util/setasap";

const conqurSystem = (self as any)._conqurInners = (self as any)._conqurInners || {
  processes: {},
  messageQueue: [],
  messageQueueIndex: 0,
  errors: {
    byMessageId: {}, byProcessId: {}
  },
  pidCounter: 0,
  midCounter: 0
};


export interface Process {
  name?: string;
  self: () => number;
  handleCall?: (any) => Promise<any>;
  handleCast: (any) => void;
};

const registerProcess = (pid: number, process:Process) => {
  conqurSystem.processes[pid] = process;
};

const isProcess = (pid: number) => {
  return !isNil(conqurSystem.processes[pid]);
}

const queueMessage = (pid, mid, message) => {
  conqurSystem.messageQueue.push({pid,message,mid});
};

const getNextMessage = () => {
  const message = conqurSystem.messageQueue[conqurSystem.messageQueueIndex];
  conqurSystem.messageQueueIndex++;
  if (conqurSystem.messageQueueIndex == conqurSystem.messageQueue.length) {
    conqurSystem.messageQueue = [];
    conqurSystem.messageQueueIdx = 0;
  } else {
    setAsap(processEventQueue)
  }
  return message;
}

const registerError = (errorPacket) => {
  const {mid, pid} = errorPacket;
  conqurSystem.errors.byMessageId[mid] = errorPacket;
  if ( conqurSystem.errors.byProcessId[pid] == null) {
    conqurSystem.errors.byProcessId[pid] = [];
  }
  conqurSystem.errors.byProcessId[pid].push(errorPacket);
};

const processEventQueue = () => {
  const {pid,message, mid} = getNextMessage();

  if (!isProcess(pid)) {
    throw new Error(`Cannot handle a queued message for a non-existent process: ${pid}`);
  }
  const process = getProcess(pid);
  try {
    process.handleCast(message);
  } catch (error) {
    registerError({message,mid,pid,error});
  }
};

const getProcess = (pid) => {
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
export const create: (x: Process) => number = (process: Process) => {
  const result = conqurSystem.pidCounter++;
  process.self = () => result;
  registerProcess(result,process);
  return result;
};

export const destroy = (pid:number) => {
  if (isProcess(pid)) {
    delete conqurSystem.processes[pid];
  } else {
    throw new Error(`Cannot destroy a non-existent process: ${pid}`);
  }
};

export const cast = (pid, message: any) => {
  if (!isProcess(pid)) {
    throw new Error(`Cannot cast a message to a non-existent process: ${pid}`);
  }
  const mid = conqurSystem.midCounter++;
  queueMessage(pid,mid,message);
  setAsap(processEventQueue);
  return mid;
};

export async function call(pid, message) {
  if (!isProcess(pid)) throw new Error(`Cannot call a non-existent process: ${pid}`);
  const process = getProcess(pid);
  return await process.handleCall(message);
};
