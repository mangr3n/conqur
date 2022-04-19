import { ProcessID } from './types';
export declare const Registry: {
    create: (process: ProcessID, name: string) => any;
    lookup: (name: string) => any;
};
