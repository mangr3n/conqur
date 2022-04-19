import { Process, ProcessID } from './types';
/**
 * 1. Creates a process from the process definition,
 * 2. Registers the process with the conqer System
 * @returns the process id
 */
export declare const create: (process: Process) => number;
export declare const destroy: (pid: number) => void;
export declare const cast: (pid: ProcessID, message: any) => number;
export declare const call: (pid: number, message: any) => any;
