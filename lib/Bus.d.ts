declare var BusFn: (name: string) => BusAPI;
declare type HandlerID = number;
declare type EventType = string;
interface BusEvent {
    type: EventType;
    [index: string]: any;
}
declare type HandlerFn = (event: BusEvent) => boolean;
interface HandlerRegistration {
    event: EventType;
    handler: HandlerFn;
    options: object;
}
export interface BusAPI {
    getBus: BusFn;
    initialize: (x: [HandlerRegistration]) => void;
    sendEvent: (event: BusEvent) => void;
    handle: (event: EventType, handler: HandlerFn, options?: object) => HandlerID;
    handleOnce: (event: EventType, handler: HandlerFn) => HandlerID;
    unhandle: (id: HandlerID) => void;
    debug: () => boolean;
}
declare type BusFn = (arg0: string) => BusAPI;
export declare const Bus: BusAPI;
export {};
