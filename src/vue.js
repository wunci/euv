import Dep from "./dep";
import Watcher from "./watcher";
import Observer from "./observer";
import Complie from "./complie";
import { noop } from "./util";
import { vNode } from "./vnode/virtual-dom";
export default class Vue {
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
    this.callHook("mounted");
  }
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
  initComputed(vm) {
    const computed = this.$option.computed;
    var watchers = (vm._computedWatchers = Object.create(null));
    var computedWatcherOptions = { lazy: true };
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
        const fn = this.defineComputed(key);
        Object.defineProperty(vm, key, {
          enumerable: true,
          configurable: true,
          get: fn,
        });
      }
    });
  }
  initWatch(vm) {
    var watchers = (vm._watchWatchers = Object.create(null));
    Object.keys(this.$option.watch).forEach((val) => {
      watchers[val] = new Watcher(
        vm,
        () => {
          return this[val];
        },
        this.$option.watch[val]
      );
    });
  }
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
      var watcher = this._computedWatchers && this._computedWatchers[key];
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
  callHook(hook) {
    this.$option[hook] && this.$option[hook].call(this, this);
  }
  _getData(exp, i) {
    let val = this;
    exp = exp.split(".");
    exp.forEach((k) => {
      val = val[k];
    });
    return i !== undefined ? val[i] : val;
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
  _createEle(val, attr, children = [this._emptyNode()]) {
    // 列表渲染使用
    if (Array.isArray(children)) {
      children = children.reduce((now, val) => {
        return now.concat(val);
      }, []);
    }
    return vNode(val, attr, children);
  }
  // for列表
  _listEle(val, render) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === "string") {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    }
    return ret;
  }
}
