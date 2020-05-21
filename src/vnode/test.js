import { vnode, patchVnode, createElement } from "./virtual-dom";

const vNode1 = vnode("div", { id: "app" }, [
  vnode("h1", { "data-title": "header" }, [
    vnode("textNode", {}, ["Virtual Dom"]),
  ]),
  vnode("ul", { class: "ul1" }, [
    vnode("li", { key: 1 }, [vnode("textNode", {}, ["1"])]),
    vnode("li", { key: 2 }, [vnode("textNode", {}, ["2"])]),
    vnode("li", { key: 3 }, [vnode("textNode", {}, ["3"])]),
  ]),
]);

document.body.appendChild(createElement(vNode1));

const vNode2 = vnode("div", { id: "app" }, [
  vnode("h4", { id: "header" }, [vnode("textNode", {}, ["元素标签改变了"])]),
  vnode("ul", { class: "ul2" }, [
    vnode("li", { key: 5 }, [vnode("textNode", {}, ["5"])]),
    vnode("li", { key: 2 }, [vnode("textNode", {}, ["2"])]),
    vnode("li", { key: 1 }, [vnode("textNode", {}, ["1"])]),
    vnode("li", { key: 4 }, [vnode("textNode", {}, ["4"])]),
  ]),
]);

/** test case **/

// const vNode2 = vnode("div", { id: "app" }, [
//   vnode("h4", { id: "header", class: "h4" }, [
//     vnode("textNode", {}, ["元素标签改变了"])
//   ]),
//   vnode("ul", { class: "ul2" }, []),
//   vnode("b", { id: "b1" }, [vnode("textNode", {}, ["test"])])
// ]);

// 更新DOM
patchVnode(vNode1, vNode2);

with (this) {
  return _createEle("div", { id: "div1" }, [
    _createEle("p", {
      directives: [{ name: "html", value: html, exp: "html" }],
    }),
    _textNode("\n      " + obj.data + " 这是模版 " + message + "\n      "),
    _createEle("p", {}, _textNode("" + message + " " + modelMessage + "")),
    _createEle("input", {
      type: "text",
      directives: [{ name: "model", value: modelMessage, exp: "modelMessage" }],
    }),
    _createEle(
      "div",
      {
        class: "div2",
        directives: [{ name: "show", value: show, exp: "show" }],
        style: "font-size: 40px;",
      },
      _createEle("div", {}, _textNode("test show"))
    ),
    ok
      ? _createEle(
          "p",
          { directives: [{ name: "if", value: ok, exp: "ok" }] },
          _textNode("测试 v-if")
        )
      : _emptyNode(),
    _createEle("p", {}, _textNode("" + hello + "")),
    _createEle(
      "div",
      {
        style: "font-size:30px;",
        directives: [{ name: "click", value: fn, exp: "fn" }],
      },
      _textNode("点击切换值")
    ),
    _listEle(list, function(item, index) {
      return _createEle(
        "div",
        {
          directives: [
            {
              name: "for",
              value: "(item, index) in list",
              exp: "(item, index) in list",
            },
          ],
          class: "list",
        },
        _textNode("\n        item: " + item + ", index: " + index + "\n      ")
      );
    }),
  ]);
}
with (this) {
  return _createEle("div", { id: "div1" }, [
    _createEle("p", {
      directives: [{ name: "html", value: "html", exp: "html" }],
    }),
    _textNode("\n      " + a.b + " 123 " + test + "\n      "),
    _createEle("p", {}, _textNode("" + b + "")),
    _createEle("p", {}, _textNode("" + test + "")),
    _createEle("input", {
      type: "text",
      directives: [{ name: "model", value: "test", exp: "test" }],
    }),
    _createEle("p", {
      directives: [{ name: "html", value: "html", exp: "html" }],
    }),
    _createEle(
      "div",
      { directives: [{ name: "show", value: "c", exp: "c" }] },
      _createEle("div", {}, _textNode("" + html + ""))
    ),
    c
      ? _createEle(
          "p",
          {
            directives: [
              { name: "if", value: "c", exp: "c" },
              { name: "click", value: "fn", exp: "fn" },
            ],
          },
          _textNode("c hello " + hello + "")
        )
      : _emptyNode(),
    _createEle(
      "p",
      { if: "d", directives: [{ name: "click", value: "fn", exp: "fn" }] },
      _textNode("d hello " + hello + "")
    ),
    _listEle(list, function(item, index) {
      return _createEle(
        "div",
        {
          directives: [
            {
              name: "for",
              value: "(item, index) in list",
              exp: "(item, index) in list",
            },
          ],
          class: "list",
        },
        _textNode("\n        " + item + " 测试一下 " + index + "\n      ")
      );
    }),
  ]);
}
