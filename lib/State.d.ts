export declare const State: {
    getState: (scope: string, busName: string) => any;
    set: (name: string, value: any) => void;
    unset: (name: string) => void;
    get: (name?: string | null) => any;
};
