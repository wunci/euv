export function noop() {}
const hasOwnProperty = Object.prototype.hasOwnProperty; // 在对象为未知的情况下使用，很重要，一般都是obj.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
const _toString = Object.prototype.toString;
export function isPlainObject(obj) {
  return _toString.call(obj) === "[object Object]";
}
