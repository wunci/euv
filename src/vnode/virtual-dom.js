import {
  isDef,
  isUndef,
  sameVnode,
  dataChanged,
  findIdxInOld,
  createKeyToOldIdx,
  addVnodes,
  removeVnodes,
} from "./util";
export function vNode(tag, data, children, $el) {
  return {
    tag,
    data,
    children,
    $el,
  };
}

/**
 * @description 创建元素
 * @param {Object} vNode 虚拟dom
 * @returns Element
 */
export function createElement(vNode) {
  if (!vNode) return;
  let el;
  if (vNode.tag === "textNode") {
    el = document.createTextNode(vNode.children[0]);
  } else {
    el = document.createElement(vNode.tag);
    for (const key in vNode.data) {
      // [TODO] 绑定事件
      if (vNode.data.hasOwnProperty(key)) {
        if (vNode.data.directives) {
          vNode.data.directives.forEach((directive) => {
            // console.log(directive);
            switch (directive.name) {
              case "click":
                el.addEventListener(
                  "click",
                  this[directive.value].bind(this),
                  false
                );
                break;
              case "model":
                el.value = this[directive.value];
                el.addEventListener(
                  "input",
                  (e) => {
                    this[directive.value] = e.target.value;
                  },
                  false
                );
                break;
              case "show":
                // debugger;
                // if(this[directive.value]){
                el.style.display = this[directive.value] ? "block" : "none";
                // }
                break;
              default:
                break;
            }
          });
        } else {
          if (key !== "directives") {
            el.setAttribute(key, vNode.data[key]);
          }
        }
      }
    }
    if (Array.isArray(vNode.children) && vNode.children.length > 0) {
      vNode.children.forEach((val) => {
        el.appendChild(createElement.call(this, val));
      });
    } else if (vNode.children) {
      el.appendChild(createElement.call(this, vNode.children));
    }
  }
  vNode.$el = el;
  return el;
}

export function patchVnode(oldVnode, vnode) {
  vnode.$el = oldVnode.$el;
  var oldCh = oldVnode.children;
  var ch = vnode.children;
  // 1. 文本节点都一样
  if (oldVnode.tag === "textNode" || vnode.tag === "textNode") {
    if (oldVnode.children[0] !== vnode.children[0]) {
      oldVnode.$el.textContent = vnode.children[0];
    }
    return;
  }
  // 2. data是否被改变
  if (dataChanged(oldVnode.data, vnode.data)) {
    const oldData = oldVnode.data;
    const newData = vnode.data;
    const oldDataKeys = Object.keys(oldData);
    const newDataKeys = Object.keys(newData);
    if (oldDataKeys.length === 0) {
      for (let i = 0; i < oldDataKeys.length; i++) {
        oldVnode.$el.removeAttribute(oldData[i]);
      }
    } else {
      const filterKeys = new Set([...oldDataKeys, ...newDataKeys]);
      for (let key of filterKeys) {
        if (isUndef(newData[key])) {
          oldVnode.$el.removeAttribute(oldData[key]);
        } else if (newData[key] !== oldData[key] && key !== "directives") {
          oldVnode.$el.setAttribute(key, newData[key]);
        }
      }
    }
  }
  if (oldCh.length || ch.length) {
    updateChildren(oldVnode.$el, oldCh, ch);
  }
}
/**
 * @description 更新子节点
 * @export
 * @param {*} parentElm 父级元素
 * @param {*} oldCh 旧子元素
 * @param {*} newCh 新子元素
 */
export function updateChildren(parentElm, oldCh, newCh) {
  if (oldCh) var oldStartIdx = 0;
  var newStartIdx = 0;
  var oldEndIdx = oldCh.length - 1;
  var oldStartVnode = oldCh[0];
  var oldEndVnode = oldCh[oldEndIdx];
  var newEndIdx = newCh.length - 1;
  var newStartVnode = newCh[0];
  var newEndVnode = newCh[newEndIdx];
  var oldKeyToIdx, idxInOld, vnodeToMove;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      parentElm.insertBefore(oldStartVnode.$el, oldEndVnode.$el.nextSibling);

      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      parentElm.insertBefore(oldEndVnode.$el, oldStartVnode.$el);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (isUndef(oldKeyToIdx)) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      if (isUndef(idxInOld)) {
        parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.$el);
      } else {
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode);
          oldCh[idxInOld] = undefined;
          parentElm.insertBefore(vnodeToMove.$el, oldStartVnode.$el);
        } else {
          parentElm.insertBefore(
            createElement(newStartVnode),
            oldStartVnode.$el
          );
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx > oldEndIdx) {
    addVnodes(parentElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}
