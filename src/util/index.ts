import { getSelf } from './self';

type FilterCB = (v: any) => boolean;
const filterArr = (cb: FilterCB, arr: any[]) => {
  const res = [];
  for (const item of arr) if (cb(item)) res.push(item);
  return res;
};
const filterObj = (cb: FilterCB, obj: any) => {
  const result = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (cb(obj[key])) result[key] = obj[key];
  }
  return result;
};

type ReduceCB = (acc: any, item: any, index?: any, array?: any) => any;

const reduceIterable = (cb: ReduceCB, acc: any, gen: any) => {
  let step = gen.next();
  while (!step.done) {
    acc = cb(acc, step.value);
    step = gen.next();
  }
  return acc;
};

const arrayReduce = (cb: ReduceCB, initial: any, array: any[]) => {
  const length = array.length;
  let result = initial;
  for (let i = 0; i < length; i++) {
    result = cb(result, array[i], i, array);
  }
  return result;
};

const shallowClone = (obj: object) => {
  const res = {};
  if (typeof obj !== 'object') {
    return res;
  }
  if (Array.isArray(obj)) {
    return obj.slice();
  }
  for (const k in obj) {
    res[k] = obj[k];
  }
  return res;
};

let map: any;
try {
  map = Map;
} catch (_) {}

let set: any;
try {
  set = Set;
} catch (_) {}

const equals: (a: any, b: any, c?: any[]) => boolean = (a: any, b: any, circulars: any[] = []) => {
  const circ: any[] = circulars.concat([a, b]);
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) return false;
  if (a instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp) {
    return a.toString() === b.toString();
  }
  if (set && a instanceof set) {
    return equals(a.values(), b.values(), circ);
  }
  if (map && a instanceof map) {
    return equals(a.entries(), b.entries(), circ);
  }
  if (typeA === 'object' && typeA === typeB) {
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (const i of keys) {
      let k = 0;
      for (k of circ) {
        if (circ[k] === a[keys[i]]) {
          break;
        }
      }
      if (k < circ.length) {
        if (a[keys[i]] !== b[keys[i]]) {
          return false;
        }
      } else if (!equals(a[keys[i]], b[keys[i]], circ)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

const reduce = (cb: any, initial: any, iterable: any) => {
  if (Array.isArray(iterable)) {
    return arrayReduce(cb, initial, iterable);
  }
  if (iterable.reduce) {
    return iterable.reduce(cb, initial);
  }
  if (iterable.next) {
    return reduceIterable(cb, initial, iterable);
  }
  if (typeof Symbol !== 'undefined' && iterable[Symbol.iterator]) {
    return reduceIterable(cb, initial, iterable[Symbol.iterator]());
  }
  if (process.env.NODE_ENV !== 'production') {
    throw new TypeError('Argument should be iterable');
  }
};

const Utils = {
  isNil: (v: any) => {
    if (v === undefined || v === null) return true;
    return false;
  },
  defaultTo: (defaultValue: any, actualValue: any) => (Utils.isNil(actualValue) ? defaultValue : actualValue),
  is: (constructor: any, val: any) => (val != null ? val.constructor === constructor : val === constructor),
  isFunction: (val: any) => Utils.is(Function, val),
  isString: (val: any) => Utils.is(String, val),
  isArray: (val: any) => Array.isArray(val),
  filter: (cb: (v: any) => boolean, val: any) => {
    return Utils.isArray(val) ? filterArr(cb, val) : filterObj(cb, val);
  },
  fromPairs: (arr: []) => {
    const obj = {};
    let i = 0;
    while (i < arr.length) {
      obj[arr[i][0]] = arr[i][1];
      i++;
    }
    return obj;
  },
  toPairs: (obj: object) => {
    const res: any[] = [];
    for (const k in obj) {
      if (obj.hasOwnProperty(k)) res.push([k, obj[k]]);
    }
    return res;
  },
  assoc: (path: string, val: any, obj: object) => {
    let res = shallowClone(obj);
    if (typeof path === 'number' && !Array.isArray(res)) res = [];
    res[path] = val;
    return res;
  },
  drop: (n: number, from: []) => (n <= 0 ? from : from.slice(n)),
  prop: (key: string, obj: object) => obj[key],
  contains: (value: any, list: []) => list.some((item) => equals(item, value)),
  equals,
  map: (f: (v: any) => any, element: any) => {
    let res;
    let i = 0;
    if (Utils.isArray(element)) {
      // it's quicker with new operator, so do NOT remove it
      res = new Array(element.length);
      while (i < res.length) {
        res[i] = f(element[i++]);
      }
      return res;
    }
    res = {};
    for (const key in element) {
      if (element.hasOwnProperty(key)) {
        res[key] = f(element[key]);
      }
    }
    return res;
  },
  reduce,
  mountNamespace: (name: string, value: any) => {
    let currentRoot: object = getSelf();
    const nameParts: string[] = name.split('.');
    while (nameParts.length > 0) {
      const part: string = nameParts.shift() || '';
      if (nameParts.length === 0) {
        currentRoot[part] = value;
      } else {
        if (Utils.isNil(currentRoot[part])) {
          currentRoot[part] = {};
        }
        currentRoot = currentRoot[part];
      }
    }
  },
};

export default Utils;
