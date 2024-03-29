declare const Utils: {
    isNil: (v: any) => boolean;
    defaultTo: (defaultValue: any, actualValue: any) => any;
    is: (constructor: any, val: any) => boolean;
    isFunction: (val: any) => boolean;
    isString: (val: any) => boolean;
    isArray: (val: any) => boolean;
    filter: (cb: (v: any) => boolean, val: any) => {};
    fromPairs: (arr: []) => {};
    toPairs: (obj: object) => any[];
    assoc: (path: string, val: any, obj: object) => {};
    drop: (n: number, from: []) => never[];
    prop: (key: string, obj: object) => any;
    contains: (value: any, list: []) => boolean;
    equals: (a: any, b: any, c?: any[] | undefined) => boolean;
    map: (f: (v: any) => any, element: any) => {};
    reduce: (cb: any, initial: any, iterable: any) => any;
    mountNamespace: (name: string, value: any) => void;
};
export default Utils;
