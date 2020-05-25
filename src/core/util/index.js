export * from "./next-tick";
export const inBrowser = typeof window !== "undefined";
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE = UA && /msie|trident/.test(UA);
export const isIE9 = UA && UA.indexOf("msie 9.0") > 0;
export const isEdge = UA && UA.indexOf("edge/") > 0;
export const isAndroid = UA && UA.indexOf("android") > 0;
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

export function isNative(Ctor) {
  return typeof Ctor === "function" && /native code/.test(Ctor.toString());
}

export function noop() {}

const hasOwnProperty = Object.prototype.hasOwnProperty; // 在对象为未知的情况下使用，很重要，一般都是obj.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

const _toString = Object.prototype.toString;
export function isPlainObject(obj) {
  return _toString.call(obj) === "[object Object]";
}

export function def(obj, key, val) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}
