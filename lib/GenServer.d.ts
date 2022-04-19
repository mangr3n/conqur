import { ProcessAccessor } from './types';
interface State {
    [index: string]: any;
}
export interface Message {
    [index: string]: any;
    type: string;
    done?: () => void;
}
declare type CastHandler = (self: ProcessAccessor, state: State, msg: Message) => any;
declare type CallHandler = (self: ProcessAccessor, state: State, msg: Message) => any;
interface CastHandlerMap {
    [index: string]: CastHandler;
}
interface CallHandlerMap {
    [index: string]: CallHandler;
}
export interface GenServerDefinition {
    name: string;
    initialState: any;
    castHandlers?: CastHandlerMap;
    callHandlers?: CallHandlerMap;
}
export declare const GenServer: ({ name, castHandlers, callHandlers, initialState }: GenServerDefinition) => any;
export {};
