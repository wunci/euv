import Dep from "./dep";
import Watcher from "./watcher";
import Observer from "./observer";
import Complie from "./complie";
import { noop, nextTick } from "./util/index";
import { vNode } from "../vnode/virtual-dom";
export default class Euv {
  constructor(options) {
    this.$option = options;
    this.$data = options.data;
    this.$el = options.el;
    this.callHook("beforeCreate");
    // this.data.xx -> this.xx
    Object.keys(this.$data).forEach((key) => {
      this.proxy(key);
    });
    new Observer(this.$data);
    this.initComputed(this);
    this.initMethods(this);
    this.initWatch(this);
    this.callHook("created");
    new Complie(this.$el, this);
  }
  /**
   * 数据代理，this.data.xx -> this.xx
   */
  proxy(key) {
    Object.defineProperty(this, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      get() {
        return this.$data[key];
      },
      set(newVal) {
        this.$data[key] = newVal;
      },
    });
  }
  /**
   * 注册computed
   */
  initComputed(vm) {
    const computed = this.$option.computed || {};
    const watchers = (vm._computedWatchers = Object.create(null));
    const computedWatcherOptions = { lazy: true };
    Object.keys(computed).forEach((key) => {
      const userDef = computed[key];
      const getter = typeof userDef === "function" ? userDef : userDef.get;
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
      if (!(key in vm)) {
        const getterFn = this.defineComputed(key);
        Object.defineProperty(vm, key, {
          enumerable: true,
          configurable: true,
          get: getterFn,
        });
      }
    });
  }
  /**
   * 注册watch
   */
  initWatch(vm) {
    const watchers = (vm._watchWatchers = Object.create(null));
    Object.keys(this.$option.watch || {}).forEach((val) => {
      watchers[val] = new Watcher(
        vm,
        () => {
          return this[val];
        },
        this.$option.watch[val]
      );
    });
  }
  /**
   * 注册methods
   */
  initMethods(vm) {
    Object.keys(this.$option.methods).forEach((key) => {
      Object.defineProperty(vm, key, {
        enumerable: true, // 可枚举
        configurable: false, // 不能再define
        get() {
          return this.$option.methods[key];
        },
      });
    });
  }
  defineComputed(key) {
    return function computedGetter() {
      const watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value;
      }
    };
  }
  // 声明周期
  callHook(hook) {
    Dep.pushTarget();
    this.$option[hook] && this.$option[hook].call(this, this);
    Dep.popTarget();
  }
  $nextTick(fn) {
    return nextTick(fn, this);
  }
  // create vNode
  // 空节点
  _emptyNode() {
    return [vNode("textNode", {}, [""])];
  }
  // textNode
  _textNode(val) {
    return [vNode("textNode", {}, [String(val || "")])];
  }
  // 创建元素
  _createEle(val, attr, ...children) {
    if (!children || children.length === 0) children = [this._emptyNode()];
    // 列表渲染使用，结构可能是 [[{},{}],{}]
    children = children.flat(Infinity);
    return vNode(val, attr, children);
  }
  // for列表
  _listEle(val, render) {
    let ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === "string") {
      // v-for="item in '123'" or array
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === "number") {
      // v-for="item in 10"
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else {
      // v-for="item in list"
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    return ret;
  }
}
