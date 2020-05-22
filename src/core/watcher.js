import Dep from "./dep";
import { nextTick } from "./util/index";
let flushing = false; // 是否在更新
let waiting = false; // 是否在等待视图更新
let queue = []; // 更新队列
let has = {};
let uidWather = 0;
export default class Watcher {
  constructor(vm, expOrFn, cb, options = {}) {
    this.vm = vm;
    this.cb = cb;
    this.expOrFn = expOrFn;
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      this.getter = this.parseGetter(expOrFn.trim());
    }
    this.id = ++uidWather;
    this.deps = []; // old deps
    this.newDeps = []; // new deps
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.lazy = !!options.lazy;
    this.dirty = this.lazy;
    this.value = this.lazy ? undefined : this.get();
  }
  get() {
    Dep.pushTarget(this);
    // Dep.target = this;
    const value = this.getter.call(this.vm, this.vm);
    // Dep.target = null;
    Dep.popTarget();
    this.cleanupDeps();
    return value;
  }
  update() {
    this.queueWatcher(this);
  }
  run() {
    let value = this.get();
    let oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
  /**
   * 计算属性使用
   */
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  /**
   * string转函数
   */
  parseGetter(exp) {
    const fnStr = `with(this){return ${exp}}`;
    const getter = new Function(fnStr);
    return getter;
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  queueWatcher(watcher) {
    const id = watcher.id;
    // 过滤重复的watcher
    if (has[id] === null || has[id] === undefined) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      }
      // 只执行一次更新队列
      if (!waiting) {
        waiting = true;
        nextTick(this.flushQueue, this.vm);
      }
    }
  }
  /**
   * 异步更新队列
   */
  flushQueue(vm) {
    flushing = true;
    vm.callHook("beforeUpdate");
    for (let index = 0; index < queue.length; index++) {
      let watcher = queue[index];
      let id = watcher.id;
      has[id] = null; // 重置
      watcher.run(); // diff更新
    }
    // 重置状态
    waiting = flushing = false;
    queue.length = 0;
    vm.callHook("updated");
  }
  /**
   * 把当前不存在的dep删除，然后赋值最新的收集到的dep
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      let dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds; // Set
    this.depIds = this.newDepIds; // 赋值最新dep id列表 Set类型
    this.newDepIds = tmp; // Set
    this.newDepIds.clear(); // 清空
    tmp = this.deps; // array
    this.deps = this.newDeps; // 赋值最新dep列表
    this.newDeps = tmp; // array
    this.newDeps.length = 0; // 清空
  }
}
