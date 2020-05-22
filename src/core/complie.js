import { createElement, patchVnode } from "../vnode/virtual-dom";
import Watcher from "./watcher";
export default class Complie {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
    const renderVnode = this.render(this.$el);
    let vNodeFnStr = `
      with (this) {
        return _createEle(
          '${this.$el.nodeName.toLowerCase()}',
          ${JSON.stringify(this.getAttrData(this.$el))},
          [${renderVnode}]
        )
      }
    `;
    // 把v-if else的 @elif@ 替换成空节点
    vNodeFnStr = vNodeFnStr.replace(/@elif@/g, "_emptyNode()");
    // 将虚拟dom的字符串转函数，以后每次都拿这个函数重新生成虚拟dom，因为结构是不会变的
    this.$vm.$render = new Function(vNodeFnStr);
    // 生成虚拟dom
    const vnode = this.$vm.$render.call(vm, vm);
    // 插入通过虚拟dom生成的dom
    const oldDom = createElement.call(this.$vm, vnode);
    // 在模版后面插入新的dom
    this.$el.parentNode.insertBefore(oldDom, this.$el.nextSibling);
    // 移除原来模版
    this.$el.parentNode.removeChild(this.$el);
    // 赋值最新的dom
    this.$el = oldDom;
    // 赋值最新的虚拟dom，也可以称之为旧的虚拟dom
    this.$vm.oldVnode = vnode;
    // beforeMount
    this.$vm.callHook("beforeMount");
    this.initWatcher();
    // mounted
    this.$vm.callHook("mounted");
  }
  initWatcher() {
    new Watcher(
      this.$vm,
      function() {
        // 渲染新的虚拟dom，进行diff
        const render = this.$render.call(this, this);
        patchVnode(this.oldVnode, render);
        this.oldVnode = render;
      },
      () => {}
    );
  }
  /**
   * 生成虚拟dom数组，ps: 第二层虚拟dom列表，第一层是挂载的根元素，在上面构造函数可以看到
   */
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
  /**
   * 解析文本节点
   */
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
        value = `'${value}'`.replace(/\n/g, "\\n");
      }
      vNodeChildren.push(`_textNode(${value})`);
    }
  }
  /**
   * 解析元素节点
   */
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
        if (name === "click") {
          attrData["directives"].push({
            name,
            value: `$function ($event) { return ${attr.value}}$`, //${attr.value.replace(/^\w+(?:\()?([^\)]*)?\)?$/,"$1")}
            exp: attr.value,
          });
        } else {
          attrData["directives"].push({
            name,
            value:
              name !== "for" && name !== "else"
                ? "$" + attr.value + "$"
                : attr.value, // 用 $value$ 站位，以便后面可以把引号去掉 "a" -> a
            exp: attr.value,
          });
        }
      }
    });
    // 初始化vnode
    let vNodeStr = `_createEle('${node.nodeName.toLowerCase()}', ${JSON.stringify(
      attrData
    )}, ${children})`;

    // value去除引号，方便直接访问到值，不然就是一个字符串
    vNodeStr = vNodeStr.replace(/['"]\$(.*)?\$['"]/g, "$1"); //"a" -> a
    let elseif;
    // 单独处理v-for和v-if
    for (let i = 0; i < attribute.length; i++) {
      const attr = attribute[i];
      if (this.isDirective(attr.name)) {
        const name = this.getDirectiveName(attr.name);
        // v-for
        if (name === "for") {
          const params = attr.value.split(/\s+in\s+/);
          vNodeStr = `_listEle(${params[1]}, function ${
            /\(\w+(\s+)?\,(\s+)?\w+\)/.test(params[0])
              ? params[0] // v-for="(item,index) in list"
              : "(" + params[0] + ")" // v-for="item in list"
          } { return ${vNodeStr} })`;
          // v-if
        } else if (name === "if") {
          vNodeStr = `${attr.value} ? ${vNodeStr} : @elif@`; // 用 @elif@ 占位
        } else if (name === "else-if") {
          elseif = `${attr.value} ? ${vNodeStr} : @elif@`; // 用 @elif@ 占位
        } else if (name === "else") {
          elseif = `${vNodeStr}`;
        }
      }
    }
    // 上一个虚拟dom存在if else模版
    if (vNodeChildren.length - 1 >= 0 && elseif) {
      vNodeChildren[vNodeChildren.length - 1] = vNodeChildren[
        vNodeChildren.length - 1
      ].replace(/@elif@/g, elseif);
    } else {
      vNodeChildren.push(vNodeStr);
    }
  }
  /**
   * 是否是指令
   */
  isDirective(attr) {
    return /(^v-|^:|^@)\w+/.test(attr);
  }
  /**
   * 获取指令名
   */
  getDirectiveName(attr) {
    return attr.replace(/(?:^v-|^:|^@)(\w+)/, "$1");
  }
  /**
   * 获取attr数据
   */
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
