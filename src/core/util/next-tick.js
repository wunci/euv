import { isNative, isIE, isIOS, noop } from "./index";

let isUsingMicroTask = false;
let callbacks = [];
let pending = false;
let timerFunc;
function flushCallbacks() {
  pending = false;
  let copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}
if (typeof Promise !== "undefined" && isNative(Promise)) {
  let p = Promise.resolve();
  timerFunc = function() {
    p.then(flushCallbacks);
    if (isIOS) {
      setTimeout(noop);
    }
  };
  isUsingMicroTask = true;
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  let counter = 1;
  let observer = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = function() {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== "undefined") {
  timerFunc = function() {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function() {
    setTimeout(flushCallbacks, 0);
  };
}

export function nextTick(cb, ctx) {
  let _resolve;
  callbacks.push(function() {
    if (cb) {
      try {
        cb.call(ctx, ctx);
      } catch (e) {
        console.log(e);
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  if (!cb && typeof Promise !== "undefined") {
    return new Promise(function(resolve) {
      _resolve = resolve;
    });
  }
}
