import { getSelf } from "./self";
var filterArr = function (cb, arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++)
        if (cb(arr[i]))
            res.push(arr[i]);
    return res;
};
var filterObj = function (cb, obj) {
    var result = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        if (cb(obj[keys[i]]))
            result[keys[i]] = obj[keys[i]];
    }
    return result;
};
var reduceIterable = function (cb, acc, gen) {
    var step = gen.next();
    while (!step.done) {
        acc = cb(acc, step.value);
        step = gen.next();
    }
    return acc;
};
var arrayReduce = function (cb, initial, array) {
    var length = array.length;
    var result = initial;
    for (var i = 0; i < length; i++) {
        result = cb(result, array[i], i, array);
    }
    return result;
};
var shallowClone = function (obj) {
    var res = {};
    if (typeof obj !== 'object') {
        return res;
    }
    if (Array.isArray(obj)) {
        return obj.slice();
    }
    for (var k in obj) {
        res[k] = obj[k];
    }
    return res;
};
var map;
try {
    map = Map;
}
catch (_) { }
var set;
try {
    set = Set;
}
catch (_) { }
var equals = function (a, b, circulars) {
    if (circulars === void 0) { circulars = []; }
    var circ = circulars.concat([a, b]);
    if (a === b)
        return true;
    if (a == null || b == null)
        return a === b;
    var typeA = typeof a;
    var typeB = typeof b;
    if (typeA !== typeB)
        return false;
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
        var keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length)
            return false;
        for (var i = 0; i < keys.length; i++) {
            for (var k = 0; k < circ.length; k++) {
                if (circ[k] === a[keys[i]]) {
                    break;
                }
            }
            if (k < circ.length) {
                if (a[keys[i]] !== b[keys[i]]) {
                    return false;
                }
            }
            else if (!equals(a[keys[i]], b[keys[i]], circ)) {
                return false;
            }
        }
        return true;
    }
    return false;
};
var reduce = function (cb, initial, iterable) {
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
var Utils = {
    isNil: function (v) {
        if (v === undefined || v === null)
            return true;
        return false;
    },
    defaultTo: function (defaultValue, actualValue) { return Utils.isNil(actualValue) ? defaultValue : actualValue; },
    is: function (constructor, val) { return (val != null
        ? val.constructor === constructor
        : val === constructor); },
    isFunction: function (val) { return Utils.is(Function, val); },
    isString: function (val) { return Utils.is(String, val); },
    isArray: function (val) { return Array.isArray(val); },
    filter: function (cb, val) {
        return Utils.isArray(val)
            ? filterArr(cb, val)
            : filterObj(cb, val);
    },
    fromPairs: function (arr) {
        var obj = {};
        var i = 0;
        while (i < arr.length) {
            obj[arr[i][0]] = arr[i][1];
            i++;
        }
        return obj;
    },
    toPairs: function (obj) {
        var res = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k))
                res.push([k, obj[k]]);
        }
        return res;
    },
    assoc: function (path, val, obj) {
        var res = shallowClone(obj);
        if (typeof path === 'number' && !Array.isArray(res))
            res = [];
        res[path] = val;
        return res;
    },
    drop: function (n, from) { return n <= 0 ? from : from.slice(n); },
    prop: function (key, obj) { return obj[key]; },
    contains: function (value, list) { return list.some(function (item) { return equals(item, value); }); },
    equals: equals,
    map: function (f, element) {
        var res;
        var i = 0;
        if (Utils.isArray(element)) {
            // it's quicker with new operator, so do NOT remove it
            res = new Array(element.length);
            while (i < res.length) {
                res[i] = f(element[i++]);
            }
            return res;
        }
        res = {};
        for (var key in element) {
            if (element.hasOwnProperty(key)) {
                res[key] = f(element[key]);
            }
        }
        return res;
    },
    reduce: reduce,
    mountNamespace: function (name, value) {
        var currentRoot = getSelf();
        var nameParts = name.split('.');
        while (nameParts.length > 0) {
            var part = nameParts.shift();
            if (nameParts.length == 0) {
                currentRoot[part] = value;
            }
            else {
                if (Utils.isNil(currentRoot[part])) {
                    currentRoot[part] = {};
                }
                currentRoot = currentRoot[part];
            }
        }
    }
};
export default Utils;
