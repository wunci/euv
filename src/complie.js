import { createElement, patchVnode } from "./vnode/virtual-dom";
import Watcher from "./Watcher";
export default class Complie {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
    const renderVnode = this.render(this.$el);
    const vNodeFnStr = `
      with (this) {
        return _createEle(
          '${this.$el.nodeName.toLowerCase()}',
          ${JSON.stringify(this.getAttrData(this.$el))},
          [${renderVnode}]
        )
      }
    `;
    console.log(vNodeFnStr);
    this.$vm.$render = new Function("option", vNodeFnStr);
    const vnode = this.$vm.$render.call(vm, vm);
    const oldDom = createElement.call(this.$vm, vnode);
    // 在模版后面插入新的dom
    this.$el.parentNode.insertBefore(
      createElement.call(this.$vm, vnode),
      this.$el.nextSibling
    );
    // 移除原来模版
    this.$el.parentNode.removeChild(this.$el);
    this.$el = oldDom;
    this.$vm.oldVnode = vnode;
    this.initWatcher();

    //  test
    // this.$vm.b = "-----";
    // const a = this.render.call(vm, vm);
    // setTimeout(() => {
    //   patchVnode(value, a);
    // }, 1000);
  }
  initWatcher() {
    new Watcher(
      this.$vm,
      function() {
        // 渲染新的虚拟dom，进行diff
        this.callHook("beforeUpdate");
        const render = this.$render.call(this, this);
        console.log(this.oldVnode, render);
        patchVnode(this.oldVnode, render);
        this.oldVnode = render;
        this.callHook("updated");
      },
      () => {}
    );
  }
  render(el, vNodeChildren = []) {
    let childNodes = el.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === 3) {
        this.complieText(node, vNodeChildren);
      } else if (node.nodeType === 1) {
        this.complieElement(node, vNodeChildren);
      }
    }
    return vNodeChildren;
  }
  complieText(node, vNodeChildren) {
    const textConetent = node.textContent;
    // 不是空节点就收集
    if (textConetent.replace(/\n/g, "").trim() !== "") {
      let value = textConetent;
      const reg = /\{\{(.+?)\}\}/g;
      if (reg.test(textConetent)) {
        value =
          "'" +
          textConetent.replace(/\n/g, "\\n").replace(reg, (match, val) => {
            return "' + " + val + " + '";
          }) +
          "'";
      }
      vNodeChildren.push(`_textNode(${value})`);
    }
  }
  complieElement(node, vNodeChildren) {
    let children = [];
    if (node.childNodes && node.childNodes.length > 0) {
      children = this.render(node);
    }
    const attribute = node.attributes;
    let attrData = {};
    // 查找 attribute
    [...attribute].forEach((attr) => {
      if (!this.isDirective(attr.name)) {
        attrData[attr.name] = attr.value;
      } else if (this.isDirective(attr.name)) {
        const name = attr.name.substring(2);
        // if (name === "click") {
        //   attrData[name] = attr.value;
        // } else if (name === "model") {
        //   attrData["input"] = attr.value;
        // } else if (name === "show") {
        if (!attrData["directives"]) attrData["directives"] = [];
        attrData["directives"].push({
          name,
          value: attr.value,
        });
        // }
      }
    });
    // 初始化vnode
    let vNodeStr = `_createEle('${node.nodeName.toLowerCase()}', ${JSON.stringify(
      attrData
    )}, ${children})`;
    for (let i = 0; i < attribute.length; i++) {
      const attr = attribute[i];
      if (this.isDirective(attr.name)) {
        const name = attr.name.substring(2);
        // v-for
        if (name === "for") {
          const params = attr.value.split(/\s+in\s+/);
          vNodeStr = `_listEle(${params[1]}, function ${
            /\(\w+(\s+)?\,(\s+)?\w+\)/.test(params[0]) // v-for="(item,index) in list"
              ? params[0]
              : "(" + params[0] + ")"
          } { return ${vNodeStr} })`;
          // v-if
        } else if (name === "if") {
          vNodeStr = `${attr.value} ? ${vNodeStr} : _emptyNode()`;
        }
      }
    }
    vNodeChildren.push(vNodeStr);
  }
  isDirective(attr) {
    return attr.indexOf("v-") == 0;
  }
  getAttrData(el) {
    const attrData = {};
    const attribute = el.attributes;
    [...attribute].forEach((attr) => {
      if (!this.isDirective(attr.name)) {
        attrData[attr.name] = attr.value;
      }
    });
    return attrData;
  }
}
