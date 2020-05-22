import { isPlainObject, hasOwn, def } from "./util/index";
import Dep from "./dep";
import { arrayMethods, arrayKeys } from "./util/ob-array";
export default class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      if ("__proto__" in {}) {
        value.__proto__ = arrayMethods;
      } else {
        for (var i = 0, l = arrayKeys.length; i < l; i++) {
          var key = keys[i];
          def(value, key, arrayMethods[key]);
        }
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }
  defineReactive(data, key, val) {
    const dep = new Dep();
    let childOb = this.observe(val);
    Object.defineProperty(data, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      get() {
        dep.depend();
        // 深层收集依赖
        if (childOb) {
          childOb.dep.depend();
        }
        return val;
      },
      set: (newVal) => {
        if (newVal === val) return;
        val = newVal;
        childOb = this.observe(newVal); //监听传进来新的对象，this.a = {v:2}，因为新的对象需要重新劫持
        dep.notify();
      },
    });
  }
  observeArray(items) {
    for (var i = 0, l = items.length; i < l; i++) {
      this.observe(items[i]);
    }
  }
  observe(value) {
    if (typeof value !== "object") return;
    let ob;
    if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (Array.isArray(value) || isPlainObject(value)) {
      ob = new Observer(value);
    }
    return ob;
  }
}
