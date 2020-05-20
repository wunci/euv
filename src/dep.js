let uid = 0;
export default class Dep {
  static target = null;
  static targetStack = [];
  static pushTarget = function(target) {
    Dep.targetStack.push(target);
    Dep.target = target;
  };
  static popTarget = function() {
    Dep.targetStack.pop();
    Dep.target = Dep.targetStack[Dep.targetStack.length - 1];
  };
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  depend() {
    if (Dep.target) {
      // this.subs.push(Dep.target);
      Dep.target.addDep(this);
    }
  }
  notify() {
    var subs = this.subs.slice(); // 浅拷贝，不然会造成死循环
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}
// Dep.target = null;
