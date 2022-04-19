export declare type ProcessID = number;
export declare type ProcessAccessor = () => ProcessID;
export interface Process {
    name?: string;
    self: ProcessAccessor;
    handleCall?: (x: any) => any;
    handleCast: (x: any) => void;
}
