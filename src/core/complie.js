import { createElement, patchVnode } from "../vnode/virtual-dom";
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
    // console.log(vNodeFnStr);
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
  }
  initWatcher() {
    new Watcher(
      this.$vm,
      function() {
        // 渲染新的虚拟dom，进行diff
        this.callHook("beforeUpdate");
        const render = this.$render.call(this, this);
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
    const reg = /\{\{(.+?)\}\}/g;
    // 不是空节点就收集
    if (textConetent.replace(/\n/g, "").trim() !== "") {
      let value = textConetent;
      if (reg.test(textConetent)) {
        value =
          "'" +
          textConetent.replace(/\n/g, "\\n").replace(reg, (match, val) => {
            return "' + " + val + " + '";
          }) +
          "'";
      } else {
        value = `'${value}'`;
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
        // 收集directive
        const name = this.getDirectiveName(attr.name);
        if (!attrData["directives"]) attrData["directives"] = [];
        attrData["directives"].push({
          name,
          value: name !== "for" ? "$" + attr.value + "$" : attr.value,
          exp: attr.value,
        });
      }
    });
    // 初始化vnode
    let vNodeStr = `_createEle('${node.nodeName.toLowerCase()}', ${JSON.stringify(
      attrData
    )}, ${children})`;
    // value去除引号，方便直接访问到值，不然就是一个字符串
    vNodeStr = vNodeStr.replace(
      /"value":(.*)?['"]\$(.*)?\$['"]/g,
      '"value":$2'
    );
    // 单独处理v-for和v-if
    for (let i = 0; i < attribute.length; i++) {
      const attr = attribute[i];
      if (this.isDirective(attr.name)) {
        const name = this.getDirectiveName(attr.name);
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
    return /(^v-|^:)\w+/.test(attr);
  }
  getDirectiveName(attr) {
    return attr.replace(/(?:^v-|^:)(\w+)/, "$1");
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
