import Dep from "./dep";
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
    this.value = this.get();
    this.newDepIds = new Set();
    this.deps = [];
    this.lazy = !!options.lazy;
    this.dirty = this.lazy;
  }
  get() {
    // Dep.pushTarget(this);
    Dep.target = this;
    const value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    // Dep.popTarget();
    return value;
  }
  update() {
    this.run();
  }
  run() {
    let value = this.get();
    let oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  parseGetter(exp) {
    const fnStr = `with(this){return ${exp}}`;
    const getter = new Function("option", fnStr);
    return getter;
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds) this.newDepIds = new Set();
    if (!this.deps) this.deps = [];
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}
