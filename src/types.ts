export type ProcessID = number;

export type ProcessAccessor = () => ProcessID;

export interface Process {
  name?: string;
  self: ProcessAccessor;
  handleCall?: (x: any) => any;
  handleCast: (x: any) => void;
}
