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
    // if (/_getData\(/.test(exp)) {
    const str = `with(this){return ${exp}}`;
    const fn = new Function("option", str);
    return fn;
    // } else {
    // if (/[^\w.$]/.test(exp)) return; // xx.xx.

    // var exps = exp.split(".");

    // return function(vm) {
    //   let obj = vm;
    //   for (var i = 0, len = exps.length; i < len; i++) {
    //     if (!obj) return;
    //     obj = obj[exps[i]];
    //   }
    //   return obj;
    // };
    // }
  }
  addDep(dep) {
    var id = dep.id;
    if (!this.newDepIds) this.newDepIds = new Set();
    if (!this.deps) this.deps = [];
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  depend() {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}
// function name(params) {
//   with (this) {
//     return _c(
//       "div",
//       { attrs: { id: "div1" } },
//       [
//         _v("\n      " + _s(a) + " " + _s(b) + "\n      "),
//         c
//           ? _c("button", { on: { click: fn } }, [_v("按钮")])
//           : a
//           ? _c("button", { on: { click: fn } }, [_v("按钮")])
//           : _c("button", { on: { click: fn } }, [_v("按钮1")]),
//         _v(" "),
//         _l(arr, function(item, idx) {
//           return _c("span", [_v(_s(item) + " " + _s(a))]);
//         }),
//         _v(" "),
//         _c("input", {
//           directives: [
//             { name: "model", rawName: "v-model", value: a, expression: "a" },
//           ],
//           attrs: { type: "text" },
//           domProps: { value: a },
//           on: {
//             input: function($event) {
//               if ($event.target.composing) return;
//               a = $event.target.value;
//             },
//           },
//         }),
//         _v(" "),
//         _c(
//           "button",
//           {
//             directives: [
//               { name: "show", rawName: "v-show", value: c, expression: "c" },
//             ],
//             on: { click: fn },
//           },
//           [_v("按钮")]
//         ),
//       ],
//       2
//     );
//   }
// }
