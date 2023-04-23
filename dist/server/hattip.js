import * as React14 from "react";
import { uneval } from "devalue";
import { compose, composePartial } from "@hattip/compose";
import { renderToReadableStream } from "react-dom/server.browser";
const clientManifest = {
  "src/res/foreach.jpg": {
    file: "assets/foreach-62eaa14c.jpg",
    src: "src/res/foreach.jpg"
  },
  "src/res/github.jpg": {
    file: "assets/github-4ec849bc.jpg",
    src: "src/res/github.jpg"
  },
  "src/res/loading.svg": {
    file: "assets/loading-7a871f84.svg",
    src: "src/res/loading.svg"
  },
  "src/res/project.webp": {
    file: "assets/project-70e7bcfb.webp",
    src: "src/res/project.webp"
  },
  "src/res/real-estate.jpg": {
    file: "assets/real-estate-fce5b55f.jpg",
    src: "src/res/real-estate.jpg"
  },
  "src/routes/index.page.tsx": {
    assets: [
      "assets/github-4ec849bc.jpg",
      "assets/foreach-62eaa14c.jpg",
      "assets/real-estate-fce5b55f.jpg",
      "assets/project-70e7bcfb.webp",
      "assets/loading-7a871f84.svg"
    ],
    file: "assets/index.page-43343a98.js",
    imports: [
      "virtual:rakkasjs:client-entry"
    ],
    isDynamicEntry: true,
    src: "src/routes/index.page.tsx"
  },
  "src/routes/layout.css": {
    file: "assets/layout-310bb16f.css",
    src: "src/routes/layout.css"
  },
  "src/routes/layout.tsx": {
    css: [
      "assets/layout-310bb16f.css"
    ],
    file: "assets/layout-41c7876b.js",
    imports: [
      "virtual:rakkasjs:client-entry"
    ],
    isDynamicEntry: true,
    src: "src/routes/layout.tsx"
  },
  "virtual:rakkasjs:client-entry": {
    dynamicImports: [
      "src/routes/layout.tsx",
      "src/routes/index.page.tsx"
    ],
    file: "assets/index-03c790e9.js",
    isEntry: true,
    src: "virtual:rakkasjs:client-entry"
  }
};
const prodRoutes = null;
const commonHooks = {};
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var require_react_is_production_min = __commonJS({
  "../../node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/cjs/react-is.production.min.js"(exports) {
    var b2 = "function" === typeof Symbol && Symbol.for;
    var c2 = b2 ? Symbol.for("react.element") : 60103;
    var d2 = b2 ? Symbol.for("react.portal") : 60106;
    var e2 = b2 ? Symbol.for("react.fragment") : 60107;
    var f2 = b2 ? Symbol.for("react.strict_mode") : 60108;
    var g2 = b2 ? Symbol.for("react.profiler") : 60114;
    var h2 = b2 ? Symbol.for("react.provider") : 60109;
    var k2 = b2 ? Symbol.for("react.context") : 60110;
    var l2 = b2 ? Symbol.for("react.async_mode") : 60111;
    var m2 = b2 ? Symbol.for("react.concurrent_mode") : 60111;
    var n2 = b2 ? Symbol.for("react.forward_ref") : 60112;
    var p2 = b2 ? Symbol.for("react.suspense") : 60113;
    var q2 = b2 ? Symbol.for("react.suspense_list") : 60120;
    var r2 = b2 ? Symbol.for("react.memo") : 60115;
    var t2 = b2 ? Symbol.for("react.lazy") : 60116;
    var v2 = b2 ? Symbol.for("react.block") : 60121;
    var w2 = b2 ? Symbol.for("react.fundamental") : 60117;
    var x2 = b2 ? Symbol.for("react.responder") : 60118;
    var y2 = b2 ? Symbol.for("react.scope") : 60119;
    function z2(a2) {
      if ("object" === typeof a2 && null !== a2) {
        var u2 = a2.$$typeof;
        switch (u2) {
          case c2:
            switch (a2 = a2.type, a2) {
              case l2:
              case m2:
              case e2:
              case g2:
              case f2:
              case p2:
                return a2;
              default:
                switch (a2 = a2 && a2.$$typeof, a2) {
                  case k2:
                  case n2:
                  case t2:
                  case r2:
                  case h2:
                    return a2;
                  default:
                    return u2;
                }
            }
          case d2:
            return u2;
        }
      }
    }
    function A2(a2) {
      return z2(a2) === m2;
    }
    exports.AsyncMode = l2;
    exports.ConcurrentMode = m2;
    exports.ContextConsumer = k2;
    exports.ContextProvider = h2;
    exports.Element = c2;
    exports.ForwardRef = n2;
    exports.Fragment = e2;
    exports.Lazy = t2;
    exports.Memo = r2;
    exports.Portal = d2;
    exports.Profiler = g2;
    exports.StrictMode = f2;
    exports.Suspense = p2;
    exports.isAsyncMode = function(a2) {
      return A2(a2) || z2(a2) === l2;
    };
    exports.isConcurrentMode = A2;
    exports.isContextConsumer = function(a2) {
      return z2(a2) === k2;
    };
    exports.isContextProvider = function(a2) {
      return z2(a2) === h2;
    };
    exports.isElement = function(a2) {
      return "object" === typeof a2 && null !== a2 && a2.$$typeof === c2;
    };
    exports.isForwardRef = function(a2) {
      return z2(a2) === n2;
    };
    exports.isFragment = function(a2) {
      return z2(a2) === e2;
    };
    exports.isLazy = function(a2) {
      return z2(a2) === t2;
    };
    exports.isMemo = function(a2) {
      return z2(a2) === r2;
    };
    exports.isPortal = function(a2) {
      return z2(a2) === d2;
    };
    exports.isProfiler = function(a2) {
      return z2(a2) === g2;
    };
    exports.isStrictMode = function(a2) {
      return z2(a2) === f2;
    };
    exports.isSuspense = function(a2) {
      return z2(a2) === p2;
    };
    exports.isValidElementType = function(a2) {
      return "string" === typeof a2 || "function" === typeof a2 || a2 === e2 || a2 === m2 || a2 === g2 || a2 === f2 || a2 === p2 || a2 === q2 || "object" === typeof a2 && null !== a2 && (a2.$$typeof === t2 || a2.$$typeof === r2 || a2.$$typeof === h2 || a2.$$typeof === k2 || a2.$$typeof === n2 || a2.$$typeof === w2 || a2.$$typeof === x2 || a2.$$typeof === y2 || a2.$$typeof === v2);
    };
    exports.typeOf = z2;
  }
});
var require_react_is_development = __commonJS({
  "../../node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/cjs/react-is.development.js"(exports) {
    if (process.env.NODE_ENV !== "production") {
      (function() {
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element2 = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment3 = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode2 = REACT_STRICT_MODE_TYPE;
        var Suspense3 = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element2;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment3;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode2;
        exports.Suspense = Suspense3;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});
var require_react_is = __commonJS({
  "../../node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/index.js"(exports, module) {
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_is_production_min();
    } else {
      module.exports = require_react_is_development();
    }
  }
});
var require_object_assign = __commonJS({
  "../../node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js"(exports, module) {
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i2 = 0; i2 < 10; i2++) {
          test2["_" + String.fromCharCode(i2)] = i2;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n2) {
          return test2[n2];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s2 = 1; s2 < arguments.length; s2++) {
        from = Object(arguments[s2]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i2 = 0; i2 < symbols.length; i2++) {
            if (propIsEnumerable.call(from, symbols[i2])) {
              to[symbols[i2]] = from[symbols[i2]];
            }
          }
        }
      }
      return to;
    };
  }
});
var require_ReactPropTypesSecret = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module.exports = ReactPropTypesSecret;
  }
});
var require_has = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/has.js"(exports, module) {
    module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
  }
});
var require_checkPropTypes = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/checkPropTypes.js"(exports, module) {
    var printWarning = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      ReactPropTypesSecret = require_ReactPropTypesSecret();
      loggedTypeFailures = {};
      has = require_has();
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x2) {
        }
      };
    }
    var ReactPropTypesSecret;
    var loggedTypeFailures;
    var has;
    function checkPropTypes(typeSpecs, values, location2, componentName, getStack) {
      if (process.env.NODE_ENV !== "production") {
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error(
                  (componentName || "React class") + ": " + location2 + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                );
                err.name = "Invariant Violation";
                throw err;
              }
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location2, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            if (error && !(error instanceof Error)) {
              printWarning(
                (componentName || "React class") + ": type specification of " + location2 + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
              );
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              loggedTypeFailures[error.message] = true;
              var stack = getStack ? getStack() : "";
              printWarning(
                "Failed " + location2 + " type: " + error.message + (stack != null ? stack : "")
              );
            }
          }
        }
      }
    }
    checkPropTypes.resetWarningCache = function() {
      if (process.env.NODE_ENV !== "production") {
        loggedTypeFailures = {};
      }
    };
    module.exports = checkPropTypes;
  }
});
var require_factoryWithTypeCheckers = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
    var ReactIs = require_react_is();
    var assign = require_object_assign();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    var has = require_has();
    var checkPropTypes = require_checkPropTypes();
    var printWarning = function() {
    };
    if (process.env.NODE_ENV !== "production") {
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x2) {
        }
      };
    }
    function emptyFunctionThatReturnsNull() {
      return null;
    }
    module.exports = function(isValidElement2, throwOnDirectAccess) {
      var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === "function") {
          return iteratorFn;
        }
      }
      var ANONYMOUS = "<<anonymous>>";
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bigint: createPrimitiveTypeChecker("bigint"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
      };
      function is(x2, y2) {
        if (x2 === y2) {
          return x2 !== 0 || 1 / x2 === 1 / y2;
        } else {
          return x2 !== x2 && y2 !== y2;
        }
      }
      function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === "object" ? data : {};
        this.stack = "";
      }
      PropTypeError.prototype = Error.prototype;
      function createChainableTypeChecker(validate) {
        if (process.env.NODE_ENV !== "production") {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location2, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (secret !== ReactPropTypesSecret) {
            if (throwOnDirectAccess) {
              var err = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
              );
              err.name = "Invariant Violation";
              throw err;
            } else if (process.env.NODE_ENV !== "production" && typeof console !== "undefined") {
              var cacheKey = componentName + ":" + propName;
              if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3) {
                printWarning(
                  "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError("The " + location2 + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
              }
              return new PropTypeError("The " + location2 + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location2, propFullName);
          }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
      }
      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location2, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            var preciseType = getPreciseType(propValue);
            return new PropTypeError(
              "Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
              { expectedType }
            );
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
      }
      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location2, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
          }
          for (var i2 = 0; i2 < propValue.length; i2++) {
            var error = typeChecker(propValue, i2, componentName, location2, propFullName + "[" + i2 + "]", ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeChecker() {
        function validate(props, propName, componentName, location2, propFullName) {
          var propValue = props[propName];
          if (!isValidElement2(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location2, propFullName) {
          var propValue = props[propName];
          if (!ReactIs.isValidElementType(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location2, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName(props[propName]);
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          if (process.env.NODE_ENV !== "production") {
            if (arguments.length > 1) {
              printWarning(
                "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
              );
            } else {
              printWarning("Invalid argument supplied to oneOf, expected an array.");
            }
          }
          return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location2, propFullName) {
          var propValue = props[propName];
          for (var i2 = 0; i2 < expectedValues.length; i2++) {
            if (is(propValue, expectedValues[i2])) {
              return null;
            }
          }
          var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
            var type = getPreciseType(value);
            if (type === "symbol") {
              return String(value);
            }
            return value;
          });
          return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location2, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
          }
          for (var key in propValue) {
            if (has(propValue, key)) {
              var error = typeChecker(propValue, key, componentName, location2, propFullName + "." + key, ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          process.env.NODE_ENV !== "production" ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunctionThatReturnsNull;
        }
        for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
          var checker = arrayOfTypeCheckers[i2];
          if (typeof checker !== "function") {
            printWarning(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i2 + "."
            );
            return emptyFunctionThatReturnsNull;
          }
        }
        function validate(props, propName, componentName, location2, propFullName) {
          var expectedTypes = [];
          for (var i3 = 0; i3 < arrayOfTypeCheckers.length; i3++) {
            var checker2 = arrayOfTypeCheckers[i3];
            var checkerResult = checker2(props, propName, componentName, location2, propFullName, ReactPropTypesSecret);
            if (checkerResult == null) {
              return null;
            }
            if (checkerResult.data && has(checkerResult.data, "expectedType")) {
              expectedTypes.push(checkerResult.data.expectedType);
            }
          }
          var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
          return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createNodeChecker() {
        function validate(props, propName, componentName, location2, propFullName) {
          if (!isNode(props[propName])) {
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function invalidValidatorError(componentName, location2, propFullName, key, type) {
        return new PropTypeError(
          (componentName || "React class") + ": " + location2 + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
        );
      }
      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location2, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (typeof checker !== "function") {
              return invalidValidatorError(componentName, location2, propFullName, key, getPreciseType(checker));
            }
            var error = checker(propValue, key, componentName, location2, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location2, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location2 + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          var allKeys = assign({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (has(shapeTypes, key) && typeof checker !== "function") {
              return invalidValidatorError(componentName, location2, propFullName, key, getPreciseType(checker));
            }
            if (!checker) {
              return new PropTypeError(
                "Invalid " + location2 + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
              );
            }
            var error = checker(propValue, key, componentName, location2, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function isNode(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || isValidElement2(propValue)) {
              return true;
            }
            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode(step.value)) {
                    return false;
                  }
                }
              } else {
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }
            return true;
          default:
            return false;
        }
      }
      function isSymbol(propType, propValue) {
        if (propType === "symbol") {
          return true;
        }
        if (!propValue) {
          return false;
        }
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }
        return false;
      }
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }
      function getPreciseType(propValue) {
        if (typeof propValue === "undefined" || propValue === null) {
          return "" + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case "array":
          case "object":
            return "an " + type;
          case "boolean":
          case "date":
          case "regexp":
            return "a " + type;
          default:
            return type;
        }
      }
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }
      ReactPropTypes.checkPropTypes = checkPropTypes;
      ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});
var require_factoryWithThrowingShims = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/factoryWithThrowingShims.js"(exports, module) {
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    function emptyFunction() {
    }
    function emptyFunctionWithReset() {
    }
    emptyFunctionWithReset.resetWarningCache = emptyFunction;
    module.exports = function() {
      function shim(props, propName, componentName, location2, propFullName, secret) {
        if (secret === ReactPropTypesSecret) {
          return;
        }
        var err = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        err.name = "Invariant Violation";
        throw err;
      }
      shim.isRequired = shim;
      function getShim() {
        return shim;
      }
      var ReactPropTypes = {
        array: shim,
        bigint: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,
        any: shim,
        arrayOf: getShim,
        element: shim,
        elementType: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim,
        checkPropTypes: emptyFunctionWithReset,
        resetWarningCache: emptyFunction
      };
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});
var require_prop_types = __commonJS({
  "../../node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js"(exports, module) {
    if (process.env.NODE_ENV !== "production") {
      ReactIs = require_react_is();
      throwOnDirectAccess = true;
      module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module.exports = require_factoryWithThrowingShims()();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});
var require_react_fast_compare = __commonJS({
  "../../node_modules/.pnpm/react-fast-compare@3.2.0/node_modules/react-fast-compare/index.js"(exports, module) {
    var hasElementType = typeof Element !== "undefined";
    var hasMap = typeof Map === "function";
    var hasSet = typeof Set === "function";
    var hasArrayBuffer = typeof ArrayBuffer === "function" && !!ArrayBuffer.isView;
    function equal(a2, b2) {
      if (a2 === b2)
        return true;
      if (a2 && b2 && typeof a2 == "object" && typeof b2 == "object") {
        if (a2.constructor !== b2.constructor)
          return false;
        var length, i2, keys;
        if (Array.isArray(a2)) {
          length = a2.length;
          if (length != b2.length)
            return false;
          for (i2 = length; i2-- !== 0; )
            if (!equal(a2[i2], b2[i2]))
              return false;
          return true;
        }
        var it;
        if (hasMap && a2 instanceof Map && b2 instanceof Map) {
          if (a2.size !== b2.size)
            return false;
          it = a2.entries();
          while (!(i2 = it.next()).done)
            if (!b2.has(i2.value[0]))
              return false;
          it = a2.entries();
          while (!(i2 = it.next()).done)
            if (!equal(i2.value[1], b2.get(i2.value[0])))
              return false;
          return true;
        }
        if (hasSet && a2 instanceof Set && b2 instanceof Set) {
          if (a2.size !== b2.size)
            return false;
          it = a2.entries();
          while (!(i2 = it.next()).done)
            if (!b2.has(i2.value[0]))
              return false;
          return true;
        }
        if (hasArrayBuffer && ArrayBuffer.isView(a2) && ArrayBuffer.isView(b2)) {
          length = a2.length;
          if (length != b2.length)
            return false;
          for (i2 = length; i2-- !== 0; )
            if (a2[i2] !== b2[i2])
              return false;
          return true;
        }
        if (a2.constructor === RegExp)
          return a2.source === b2.source && a2.flags === b2.flags;
        if (a2.valueOf !== Object.prototype.valueOf)
          return a2.valueOf() === b2.valueOf();
        if (a2.toString !== Object.prototype.toString)
          return a2.toString() === b2.toString();
        keys = Object.keys(a2);
        length = keys.length;
        if (length !== Object.keys(b2).length)
          return false;
        for (i2 = length; i2-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b2, keys[i2]))
            return false;
        if (hasElementType && a2 instanceof Element)
          return false;
        for (i2 = length; i2-- !== 0; ) {
          if ((keys[i2] === "_owner" || keys[i2] === "__v" || keys[i2] === "__o") && a2.$$typeof) {
            continue;
          }
          if (!equal(a2[keys[i2]], b2[keys[i2]]))
            return false;
        }
        return true;
      }
      return a2 !== a2 && b2 !== b2;
    }
    module.exports = function isEqual(a2, b2) {
      try {
        return equal(a2, b2);
      } catch (error) {
        if ((error.message || "").match(/stack|recursion/i)) {
          console.warn("react-fast-compare cannot handle circular refs");
          return false;
        }
        throw error;
      }
    };
  }
});
var require_invariant = __commonJS({
  "../../node_modules/.pnpm/invariant@2.2.4/node_modules/invariant/invariant.js"(exports, module) {
    var NODE_ENV = process.env.NODE_ENV;
    var invariant = function(condition, format, a2, b2, c2, d2, e2, f2) {
      if (NODE_ENV !== "production") {
        if (format === void 0) {
          throw new Error("invariant requires an error message argument");
        }
      }
      if (!condition) {
        var error;
        if (format === void 0) {
          error = new Error(
            "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."
          );
        } else {
          var args = [a2, b2, c2, d2, e2, f2];
          var argIndex = 0;
          error = new Error(
            format.replace(/%s/g, function() {
              return args[argIndex++];
            })
          );
          error.name = "Invariant Violation";
        }
        error.framesToPop = 1;
        throw error;
      }
    };
    module.exports = invariant;
  }
});
var require_shallowequal = __commonJS({
  "../../node_modules/.pnpm/shallowequal@1.1.0/node_modules/shallowequal/index.js"(exports, module) {
    module.exports = function shallowEqual(objA, objB, compare, compareContext) {
      var ret = compare ? compare.call(compareContext, objA, objB) : void 0;
      if (ret !== void 0) {
        return !!ret;
      }
      if (objA === objB) {
        return true;
      }
      if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
        return false;
      }
      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
      for (var idx = 0; idx < keysA.length; idx++) {
        var key = keysA[idx];
        if (!bHasOwnProperty(key)) {
          return false;
        }
        var valueA = objA[key];
        var valueB = objB[key];
        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
        if (ret === false || ret === void 0 && valueA !== valueB) {
          return false;
        }
      }
      return true;
    };
  }
});
var require_types = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/types.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.types = void 0;
    var types = [
      ts({
        is: (val) => val === void 0,
        match: (str) => str === "!undefined",
        serialize: () => "!undefined",
        deserialize: () => void 0
      }),
      ts({
        is: (val) => val === Infinity,
        match: (str) => str === "!Infinity",
        serialize: () => "!Infinity",
        deserialize: () => Infinity
      }),
      ts({
        is: (val) => val === -Infinity,
        match: (str) => str === "!-Infinity",
        serialize: () => "!-Infinity",
        deserialize: () => -Infinity
      }),
      ts({
        is: (val) => typeof val === "number" && isNaN(val),
        match: (str) => str === "!NaN",
        serialize: () => "!NaN",
        deserialize: () => NaN
      }),
      ts({
        is: (val) => val instanceof Date,
        match: (str) => str.startsWith("!Date:"),
        serialize: (val) => "!Date:" + val.toISOString(),
        deserialize: (str) => new Date(str.slice("!Date:".length))
      }),
      ts({
        is: (val) => typeof val === "bigint",
        match: (str) => str.startsWith("!BigInt:"),
        serialize: (val) => "!BigInt:" + val.toString(),
        deserialize: (str) => {
          if (typeof BigInt === "undefined") {
            throw new Error("Your JavaScript environement does not support BigInt. Consider adding a polyfill.");
          }
          return BigInt(str.slice("!BigInt:".length));
        }
      }),
      ts({
        is: (val) => val instanceof RegExp,
        match: (str) => str.startsWith("!RegExp:"),
        serialize: (val) => "!RegExp:" + val.toString(),
        deserialize: (str) => {
          str = str.slice("!RegExp:".length);
          const args = str.match(/\/(.*)\/(.*)?/);
          const pattern = args[1];
          const flags = args[2];
          return new RegExp(pattern, flags);
        }
      }),
      ts({
        is: (val) => val instanceof Map,
        match: (str) => str.startsWith("!Map:"),
        serialize: (val, serializer) => "!Map:" + serializer(Array.from(val.entries())),
        deserialize: (str, deserializer) => new Map(deserializer(str.slice("!Map:".length)))
      }),
      ts({
        is: (val) => val instanceof Set,
        match: (str) => str.startsWith("!Set:"),
        serialize: (val, serializer) => "!Set:" + serializer(Array.from(val.values())),
        deserialize: (str, deserializer) => new Set(deserializer(str.slice("!Set:".length)))
      }),
      // Avoid collisions with the special strings defined above
      ts({
        is: (val) => typeof val === "string" && val.startsWith("!"),
        match: (str) => str.startsWith("!"),
        serialize: (val) => "!" + val,
        deserialize: (str) => str.slice(1)
      })
    ];
    exports.types = types;
    function ts(t2) {
      return t2;
    }
  }
});
var require_isReactElement = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/utils/isReactElement.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isReactElement = void 0;
    function isReactElement(value) {
      return typeof value === "object" && value !== null && String(value["$$typeof"]) === "Symbol(react.element)";
    }
    exports.isReactElement = isReactElement;
  }
});
var require_isCallable = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/utils/isCallable.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCallable = void 0;
    function isCallable(thing) {
      return thing instanceof Function || typeof thing === "function";
    }
    exports.isCallable = isCallable;
  }
});
var require_isObject = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/utils/isObject.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isObject = void 0;
    function isObject(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      if (Array.isArray(value)) {
        return false;
      }
      return true;
    }
    exports.isObject = isObject;
  }
});
var require_stringify = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/stringify.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringify = void 0;
    var types_1 = require_types();
    var isReactElement_1 = require_isReactElement();
    var isCallable_1 = require_isCallable();
    var isObject_1 = require_isObject();
    function stringify3(value, { forbidReactElements, space, valueName = "value", sortObjectKeys } = {}) {
      const path = [];
      const serializer = (val) => JSON.stringify(val, replacer, space);
      return serializer(value);
      function replacer(key, value2) {
        if (key !== "") {
          path.push(key);
        }
        if (forbidReactElements && (0, isReactElement_1.isReactElement)(value2)) {
          throw new Error(genErrMsg("React element"));
        }
        if ((0, isCallable_1.isCallable)(value2)) {
          const functionName = value2.name;
          throw new Error(genErrMsg("function", path.length === 0 ? functionName : void 0));
        }
        const valueOriginal = this[key];
        for (const { is, serialize } of types_1.types.slice().reverse()) {
          if (is(valueOriginal)) {
            return serialize(valueOriginal, serializer);
          }
        }
        if (sortObjectKeys && (0, isObject_1.isObject)(value2)) {
          const copy = {};
          Object.keys(value2).sort().forEach((key2) => {
            copy[key2] = value2[key2];
          });
          value2 = copy;
        }
        return value2;
      }
      function genErrMsg(valueType, valName) {
        const name = valName ? " `" + valName + "`" : "";
        const location2 = path.length === 0 ? "" : ` ${name ? "at " : ""}\`${valueName}[${path.map((p2) => `'${p2}'`).join("][")}]\``;
        const fallback = name === "" && location2 === "" ? ` ${valueName}` : "";
        return `Cannot serialize${name}${location2}${fallback} because it is a ${valueType} (https://github.com/brillout/json-serializer)`;
      }
    }
    exports.stringify = stringify3;
  }
});
var require_parse = __commonJS({
  "../../node_modules/.pnpm/@brillout+json-serializer@0.5.3/node_modules/@brillout/json-serializer/dist/cjs/parse.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    var types_1 = require_types();
    function parse2(str) {
      const value = JSON.parse(str);
      return modifier(value);
    }
    exports.parse = parse2;
    function modifier(value) {
      if (typeof value === "string") {
        return reviver(value);
      }
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          value[key] = modifier(val);
        });
      }
      return value;
    }
    function reviver(value) {
      for (const { match, deserialize } of types_1.types) {
        if (match(value)) {
          return deserialize(value, parse2);
        }
      }
      return value;
    }
  }
});
var import_prop_types = __toESM(require_prop_types());
var import_react_fast_compare = __toESM(require_react_fast_compare());
var import_invariant = __toESM(require_invariant());
var import_shallowequal = __toESM(require_shallowequal());
const { Component: e } = React14;
function a() {
  return a = Object.assign || function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var r2 = arguments[e2];
      for (var n2 in r2)
        Object.prototype.hasOwnProperty.call(r2, n2) && (t2[n2] = r2[n2]);
    }
    return t2;
  }, a.apply(this, arguments);
}
function s(t2, e2) {
  t2.prototype = Object.create(e2.prototype), t2.prototype.constructor = t2, c(t2, e2);
}
function c(t2, e2) {
  return c = Object.setPrototypeOf || function(t3, e3) {
    return t3.__proto__ = e3, t3;
  }, c(t2, e2);
}
function u(t2, e2) {
  if (null == t2)
    return {};
  var r2, n2, i2 = {}, o2 = Object.keys(t2);
  for (n2 = 0; n2 < o2.length; n2++)
    e2.indexOf(r2 = o2[n2]) >= 0 || (i2[r2] = t2[r2]);
  return i2;
}
var l = { BASE: "base", BODY: "body", HEAD: "head", HTML: "html", LINK: "link", META: "meta", NOSCRIPT: "noscript", SCRIPT: "script", STYLE: "style", TITLE: "title", FRAGMENT: "Symbol(react.fragment)" };
var p = { rel: ["amphtml", "canonical", "alternate"] };
var f = { type: ["application/ld+json"] };
var d = { charset: "", name: ["robots", "description"], property: ["og:type", "og:title", "og:url", "og:image", "og:image:alt", "og:description", "twitter:url", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt", "twitter:card", "twitter:site"] };
var h = Object.keys(l).map(function(t2) {
  return l[t2];
});
var m = { accesskey: "accessKey", charset: "charSet", class: "className", contenteditable: "contentEditable", contextmenu: "contextMenu", "http-equiv": "httpEquiv", itemprop: "itemProp", tabindex: "tabIndex" };
var y = Object.keys(m).reduce(function(t2, e2) {
  return t2[m[e2]] = e2, t2;
}, {});
var T = function(t2, e2) {
  for (var r2 = t2.length - 1; r2 >= 0; r2 -= 1) {
    var n2 = t2[r2];
    if (Object.prototype.hasOwnProperty.call(n2, e2))
      return n2[e2];
  }
  return null;
};
var g = function(t2) {
  var e2 = T(t2, l.TITLE), r2 = T(t2, "titleTemplate");
  if (Array.isArray(e2) && (e2 = e2.join("")), r2 && e2)
    return r2.replace(/%s/g, function() {
      return e2;
    });
  var n2 = T(t2, "defaultTitle");
  return e2 || n2 || void 0;
};
var b = function(t2) {
  return T(t2, "onChangeClientState") || function() {
  };
};
var v = function(t2, e2) {
  return e2.filter(function(e3) {
    return void 0 !== e3[t2];
  }).map(function(e3) {
    return e3[t2];
  }).reduce(function(t3, e3) {
    return a({}, t3, e3);
  }, {});
};
var A = function(t2, e2) {
  return e2.filter(function(t3) {
    return void 0 !== t3[l.BASE];
  }).map(function(t3) {
    return t3[l.BASE];
  }).reverse().reduce(function(e3, r2) {
    if (!e3.length)
      for (var n2 = Object.keys(r2), i2 = 0; i2 < n2.length; i2 += 1) {
        var o2 = n2[i2].toLowerCase();
        if (-1 !== t2.indexOf(o2) && r2[o2])
          return e3.concat(r2);
      }
    return e3;
  }, []);
};
var C = function(t2, e2, r2) {
  var n2 = {};
  return r2.filter(function(e3) {
    return !!Array.isArray(e3[t2]) || (void 0 !== e3[t2] && console && "function" == typeof console.warn && console.warn("Helmet: " + t2 + ' should be of type "Array". Instead found type "' + typeof e3[t2] + '"'), false);
  }).map(function(e3) {
    return e3[t2];
  }).reverse().reduce(function(t3, r3) {
    var i2 = {};
    r3.filter(function(t4) {
      for (var r4, o3 = Object.keys(t4), a2 = 0; a2 < o3.length; a2 += 1) {
        var s3 = o3[a2], c3 = s3.toLowerCase();
        -1 === e2.indexOf(c3) || "rel" === r4 && "canonical" === t4[r4].toLowerCase() || "rel" === c3 && "stylesheet" === t4[c3].toLowerCase() || (r4 = c3), -1 === e2.indexOf(s3) || "innerHTML" !== s3 && "cssText" !== s3 && "itemprop" !== s3 || (r4 = s3);
      }
      if (!r4 || !t4[r4])
        return false;
      var u3 = t4[r4].toLowerCase();
      return n2[r4] || (n2[r4] = {}), i2[r4] || (i2[r4] = {}), !n2[r4][u3] && (i2[r4][u3] = true, true);
    }).reverse().forEach(function(e3) {
      return t3.push(e3);
    });
    for (var o2 = Object.keys(i2), s2 = 0; s2 < o2.length; s2 += 1) {
      var c2 = o2[s2], u2 = a({}, n2[c2], i2[c2]);
      n2[c2] = u2;
    }
    return t3;
  }, []).reverse();
};
var O = function(t2, e2) {
  if (Array.isArray(t2) && t2.length) {
    for (var r2 = 0; r2 < t2.length; r2 += 1)
      if (t2[r2][e2])
        return true;
  }
  return false;
};
var S = function(t2) {
  return Array.isArray(t2) ? t2.join("") : t2;
};
var E = function(t2, e2) {
  return Array.isArray(t2) ? t2.reduce(function(t3, r2) {
    return function(t4, e3) {
      for (var r3 = Object.keys(t4), n2 = 0; n2 < r3.length; n2 += 1)
        if (e3[r3[n2]] && e3[r3[n2]].includes(t4[r3[n2]]))
          return true;
      return false;
    }(r2, e2) ? t3.priority.push(r2) : t3.default.push(r2), t3;
  }, { priority: [], default: [] }) : { default: t2 };
};
var I = function(t2, e2) {
  var r2;
  return a({}, t2, ((r2 = {})[e2] = void 0, r2));
};
var P = [l.NOSCRIPT, l.SCRIPT, l.STYLE];
var w = function(t2, e2) {
  return void 0 === e2 && (e2 = true), false === e2 ? String(t2) : String(t2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
var x = function(t2) {
  return Object.keys(t2).reduce(function(e2, r2) {
    var n2 = void 0 !== t2[r2] ? r2 + '="' + t2[r2] + '"' : "" + r2;
    return e2 ? e2 + " " + n2 : n2;
  }, "");
};
var L = function(t2, e2) {
  return void 0 === e2 && (e2 = {}), Object.keys(t2).reduce(function(e3, r2) {
    return e3[m[r2] || r2] = t2[r2], e3;
  }, e2);
};
var j = function(e2, r2) {
  return r2.map(function(r3, n2) {
    var i2, o2 = ((i2 = { key: n2 })["data-rh"] = true, i2);
    return Object.keys(r3).forEach(function(t2) {
      var e3 = m[t2] || t2;
      "innerHTML" === e3 || "cssText" === e3 ? o2.dangerouslySetInnerHTML = { __html: r3.innerHTML || r3.cssText } : o2[e3] = r3[t2];
    }), React14.createElement(e2, o2);
  });
};
var M = function(e2, r2, n2) {
  switch (e2) {
    case l.TITLE:
      return { toComponent: function() {
        return n3 = r2.titleAttributes, (i2 = { key: e3 = r2.title })["data-rh"] = true, o2 = L(n3, i2), [React14.createElement(l.TITLE, o2, e3)];
        var e3, n3, i2, o2;
      }, toString: function() {
        return function(t2, e3, r3, n3) {
          var i2 = x(r3), o2 = S(e3);
          return i2 ? "<" + t2 + ' data-rh="true" ' + i2 + ">" + w(o2, n3) + "</" + t2 + ">" : "<" + t2 + ' data-rh="true">' + w(o2, n3) + "</" + t2 + ">";
        }(e2, r2.title, r2.titleAttributes, n2);
      } };
    case "bodyAttributes":
    case "htmlAttributes":
      return { toComponent: function() {
        return L(r2);
      }, toString: function() {
        return x(r2);
      } };
    default:
      return { toComponent: function() {
        return j(e2, r2);
      }, toString: function() {
        return function(t2, e3, r3) {
          return e3.reduce(function(e4, n3) {
            var i2 = Object.keys(n3).filter(function(t3) {
              return !("innerHTML" === t3 || "cssText" === t3);
            }).reduce(function(t3, e5) {
              var i3 = void 0 === n3[e5] ? e5 : e5 + '="' + w(n3[e5], r3) + '"';
              return t3 ? t3 + " " + i3 : i3;
            }, ""), o2 = n3.innerHTML || n3.cssText || "", a2 = -1 === P.indexOf(t2);
            return e4 + "<" + t2 + ' data-rh="true" ' + i2 + (a2 ? "/>" : ">" + o2 + "</" + t2 + ">");
          }, "");
        }(e2, r2, n2);
      } };
  }
};
var k = function(t2) {
  var e2 = t2.baseTag, r2 = t2.bodyAttributes, n2 = t2.encode, i2 = t2.htmlAttributes, o2 = t2.noscriptTags, a2 = t2.styleTags, s2 = t2.title, c2 = void 0 === s2 ? "" : s2, u2 = t2.titleAttributes, h2 = t2.linkTags, m2 = t2.metaTags, y2 = t2.scriptTags, T2 = { toComponent: function() {
  }, toString: function() {
    return "";
  } };
  if (t2.prioritizeSeoTags) {
    var g2 = function(t3) {
      var e3 = t3.linkTags, r3 = t3.scriptTags, n3 = t3.encode, i3 = E(t3.metaTags, d), o3 = E(e3, p), a3 = E(r3, f);
      return { priorityMethods: { toComponent: function() {
        return [].concat(j(l.META, i3.priority), j(l.LINK, o3.priority), j(l.SCRIPT, a3.priority));
      }, toString: function() {
        return M(l.META, i3.priority, n3) + " " + M(l.LINK, o3.priority, n3) + " " + M(l.SCRIPT, a3.priority, n3);
      } }, metaTags: i3.default, linkTags: o3.default, scriptTags: a3.default };
    }(t2);
    T2 = g2.priorityMethods, h2 = g2.linkTags, m2 = g2.metaTags, y2 = g2.scriptTags;
  }
  return { priority: T2, base: M(l.BASE, e2, n2), bodyAttributes: M("bodyAttributes", r2, n2), htmlAttributes: M("htmlAttributes", i2, n2), link: M(l.LINK, h2, n2), meta: M(l.META, m2, n2), noscript: M(l.NOSCRIPT, o2, n2), script: M(l.SCRIPT, y2, n2), style: M(l.STYLE, a2, n2), title: M(l.TITLE, { title: c2, titleAttributes: u2 }, n2) };
};
var H = [];
var N = function(t2, e2) {
  var r2 = this;
  void 0 === e2 && (e2 = "undefined" != typeof document), this.instances = [], this.value = { setHelmet: function(t3) {
    r2.context.helmet = t3;
  }, helmetInstances: { get: function() {
    return r2.canUseDOM ? H : r2.instances;
  }, add: function(t3) {
    (r2.canUseDOM ? H : r2.instances).push(t3);
  }, remove: function(t3) {
    var e3 = (r2.canUseDOM ? H : r2.instances).indexOf(t3);
    (r2.canUseDOM ? H : r2.instances).splice(e3, 1);
  } } }, this.context = t2, this.canUseDOM = e2, e2 || (t2.helmet = k({ baseTag: [], bodyAttributes: {}, encodeSpecialCharacters: true, htmlAttributes: {}, linkTags: [], metaTags: [], noscriptTags: [], scriptTags: [], styleTags: [], title: "", titleAttributes: {} }));
};
var R = React14.createContext({});
var D = import_prop_types.default.shape({ setHelmet: import_prop_types.default.func, helmetInstances: import_prop_types.default.shape({ get: import_prop_types.default.func, add: import_prop_types.default.func, remove: import_prop_types.default.func }) });
var U = "undefined" != typeof document;
var q = /* @__PURE__ */ function(e2) {
  function r2(t2) {
    var n2;
    return (n2 = e2.call(this, t2) || this).helmetData = new N(n2.props.context, r2.canUseDOM), n2;
  }
  return s(r2, e2), r2.prototype.render = function() {
    return React14.createElement(R.Provider, { value: this.helmetData.value }, this.props.children);
  }, r2;
}(e);
q.canUseDOM = U, q.propTypes = { context: import_prop_types.default.shape({ helmet: import_prop_types.default.shape() }), children: import_prop_types.default.node.isRequired }, q.defaultProps = { context: {} }, q.displayName = "HelmetProvider";
var Y = function(t2, e2) {
  var r2, n2 = document.head || document.querySelector(l.HEAD), i2 = n2.querySelectorAll(t2 + "[data-rh]"), o2 = [].slice.call(i2), a2 = [];
  return e2 && e2.length && e2.forEach(function(e3) {
    var n3 = document.createElement(t2);
    for (var i3 in e3)
      Object.prototype.hasOwnProperty.call(e3, i3) && ("innerHTML" === i3 ? n3.innerHTML = e3.innerHTML : "cssText" === i3 ? n3.styleSheet ? n3.styleSheet.cssText = e3.cssText : n3.appendChild(document.createTextNode(e3.cssText)) : n3.setAttribute(i3, void 0 === e3[i3] ? "" : e3[i3]));
    n3.setAttribute("data-rh", "true"), o2.some(function(t3, e4) {
      return r2 = e4, n3.isEqualNode(t3);
    }) ? o2.splice(r2, 1) : a2.push(n3);
  }), o2.forEach(function(t3) {
    return t3.parentNode.removeChild(t3);
  }), a2.forEach(function(t3) {
    return n2.appendChild(t3);
  }), { oldTags: o2, newTags: a2 };
};
var B = function(t2, e2) {
  var r2 = document.getElementsByTagName(t2)[0];
  if (r2) {
    for (var n2 = r2.getAttribute("data-rh"), i2 = n2 ? n2.split(",") : [], o2 = [].concat(i2), a2 = Object.keys(e2), s2 = 0; s2 < a2.length; s2 += 1) {
      var c2 = a2[s2], u2 = e2[c2] || "";
      r2.getAttribute(c2) !== u2 && r2.setAttribute(c2, u2), -1 === i2.indexOf(c2) && i2.push(c2);
      var l2 = o2.indexOf(c2);
      -1 !== l2 && o2.splice(l2, 1);
    }
    for (var p2 = o2.length - 1; p2 >= 0; p2 -= 1)
      r2.removeAttribute(o2[p2]);
    i2.length === o2.length ? r2.removeAttribute("data-rh") : r2.getAttribute("data-rh") !== a2.join(",") && r2.setAttribute("data-rh", a2.join(","));
  }
};
var K = function(t2, e2) {
  var r2 = t2.baseTag, n2 = t2.htmlAttributes, i2 = t2.linkTags, o2 = t2.metaTags, a2 = t2.noscriptTags, s2 = t2.onChangeClientState, c2 = t2.scriptTags, u2 = t2.styleTags, p2 = t2.title, f2 = t2.titleAttributes;
  B(l.BODY, t2.bodyAttributes), B(l.HTML, n2), function(t3, e3) {
    void 0 !== t3 && document.title !== t3 && (document.title = S(t3)), B(l.TITLE, e3);
  }(p2, f2);
  var d2 = { baseTag: Y(l.BASE, r2), linkTags: Y(l.LINK, i2), metaTags: Y(l.META, o2), noscriptTags: Y(l.NOSCRIPT, a2), scriptTags: Y(l.SCRIPT, c2), styleTags: Y(l.STYLE, u2) }, h2 = {}, m2 = {};
  Object.keys(d2).forEach(function(t3) {
    var e3 = d2[t3], r3 = e3.newTags, n3 = e3.oldTags;
    r3.length && (h2[t3] = r3), n3.length && (m2[t3] = d2[t3].oldTags);
  }), e2 && e2(), s2(t2, h2, m2);
};
var _ = null;
var z = /* @__PURE__ */ function(t2) {
  function e2() {
    for (var e3, r3 = arguments.length, n2 = new Array(r3), i2 = 0; i2 < r3; i2++)
      n2[i2] = arguments[i2];
    return (e3 = t2.call.apply(t2, [this].concat(n2)) || this).rendered = false, e3;
  }
  s(e2, t2);
  var r2 = e2.prototype;
  return r2.shouldComponentUpdate = function(t3) {
    return !(0, import_shallowequal.default)(t3, this.props);
  }, r2.componentDidUpdate = function() {
    this.emitChange();
  }, r2.componentWillUnmount = function() {
    this.props.context.helmetInstances.remove(this), this.emitChange();
  }, r2.emitChange = function() {
    var t3, e3, r3 = this.props.context, n2 = r3.setHelmet, i2 = null, o2 = (t3 = r3.helmetInstances.get().map(function(t4) {
      var e4 = a({}, t4.props);
      return delete e4.context, e4;
    }), { baseTag: A(["href"], t3), bodyAttributes: v("bodyAttributes", t3), defer: T(t3, "defer"), encode: T(t3, "encodeSpecialCharacters"), htmlAttributes: v("htmlAttributes", t3), linkTags: C(l.LINK, ["rel", "href"], t3), metaTags: C(l.META, ["name", "charset", "http-equiv", "property", "itemprop"], t3), noscriptTags: C(l.NOSCRIPT, ["innerHTML"], t3), onChangeClientState: b(t3), scriptTags: C(l.SCRIPT, ["src", "innerHTML"], t3), styleTags: C(l.STYLE, ["cssText"], t3), title: g(t3), titleAttributes: v("titleAttributes", t3), prioritizeSeoTags: O(t3, "prioritizeSeoTags") });
    q.canUseDOM ? (e3 = o2, _ && cancelAnimationFrame(_), e3.defer ? _ = requestAnimationFrame(function() {
      K(e3, function() {
        _ = null;
      });
    }) : (K(e3), _ = null)) : k && (i2 = k(o2)), n2(i2);
  }, r2.init = function() {
    this.rendered || (this.rendered = true, this.props.context.helmetInstances.add(this), this.emitChange());
  }, r2.render = function() {
    return this.init(), null;
  }, e2;
}(e);
z.propTypes = { context: D.isRequired }, z.displayName = "HelmetDispatcher";
var F = ["children"];
var G = ["children"];
var W = /* @__PURE__ */ function(e2) {
  function r2() {
    return e2.apply(this, arguments) || this;
  }
  s(r2, e2);
  var o2 = r2.prototype;
  return o2.shouldComponentUpdate = function(t2) {
    return !(0, import_react_fast_compare.default)(I(this.props, "helmetData"), I(t2, "helmetData"));
  }, o2.mapNestedChildrenToProps = function(t2, e3) {
    if (!e3)
      return null;
    switch (t2.type) {
      case l.SCRIPT:
      case l.NOSCRIPT:
        return { innerHTML: e3 };
      case l.STYLE:
        return { cssText: e3 };
      default:
        throw new Error("<" + t2.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
    }
  }, o2.flattenArrayTypeChildren = function(t2) {
    var e3, r3 = t2.child, n2 = t2.arrayTypeChildren;
    return a({}, n2, ((e3 = {})[r3.type] = [].concat(n2[r3.type] || [], [a({}, t2.newChildProps, this.mapNestedChildrenToProps(r3, t2.nestedChildren))]), e3));
  }, o2.mapObjectTypeChildren = function(t2) {
    var e3, r3, n2 = t2.child, i2 = t2.newProps, o3 = t2.newChildProps, s2 = t2.nestedChildren;
    switch (n2.type) {
      case l.TITLE:
        return a({}, i2, ((e3 = {})[n2.type] = s2, e3.titleAttributes = a({}, o3), e3));
      case l.BODY:
        return a({}, i2, { bodyAttributes: a({}, o3) });
      case l.HTML:
        return a({}, i2, { htmlAttributes: a({}, o3) });
      default:
        return a({}, i2, ((r3 = {})[n2.type] = a({}, o3), r3));
    }
  }, o2.mapArrayTypeChildrenToProps = function(t2, e3) {
    var r3 = a({}, e3);
    return Object.keys(t2).forEach(function(e4) {
      var n2;
      r3 = a({}, r3, ((n2 = {})[e4] = t2[e4], n2));
    }), r3;
  }, o2.warnOnInvalidChildren = function(t2, e3) {
    return (0, import_invariant.default)(h.some(function(e4) {
      return t2.type === e4;
    }), "function" == typeof t2.type ? "You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information." : "Only elements types " + h.join(", ") + " are allowed. Helmet does not support rendering <" + t2.type + "> elements. Refer to our API for more information."), (0, import_invariant.default)(!e3 || "string" == typeof e3 || Array.isArray(e3) && !e3.some(function(t3) {
      return "string" != typeof t3;
    }), "Helmet expects a string as a child of <" + t2.type + ">. Did you forget to wrap your children in braces? ( <" + t2.type + ">{``}</" + t2.type + "> ) Refer to our API for more information."), true;
  }, o2.mapChildrenToProps = function(e3, r3) {
    var n2 = this, i2 = {};
    return React14.Children.forEach(e3, function(t2) {
      if (t2 && t2.props) {
        var e4 = t2.props, o3 = e4.children, a2 = u(e4, F), s2 = Object.keys(a2).reduce(function(t3, e5) {
          return t3[y[e5] || e5] = a2[e5], t3;
        }, {}), c2 = t2.type;
        switch ("symbol" == typeof c2 ? c2 = c2.toString() : n2.warnOnInvalidChildren(t2, o3), c2) {
          case l.FRAGMENT:
            r3 = n2.mapChildrenToProps(o3, r3);
            break;
          case l.LINK:
          case l.META:
          case l.NOSCRIPT:
          case l.SCRIPT:
          case l.STYLE:
            i2 = n2.flattenArrayTypeChildren({ child: t2, arrayTypeChildren: i2, newChildProps: s2, nestedChildren: o3 });
            break;
          default:
            r3 = n2.mapObjectTypeChildren({ child: t2, newProps: r3, newChildProps: s2, nestedChildren: o3 });
        }
      }
    }), this.mapArrayTypeChildrenToProps(i2, r3);
  }, o2.render = function() {
    var e3 = this.props, r3 = e3.children, n2 = u(e3, G), i2 = a({}, n2), o3 = n2.helmetData;
    return r3 && (i2 = this.mapChildrenToProps(r3, i2)), !o3 || o3 instanceof N || (o3 = new N(o3.context, o3.instances)), o3 ? /* @__PURE__ */ React14.createElement(z, a({}, i2, { context: o3.value, helmetData: void 0 })) : /* @__PURE__ */ React14.createElement(R.Consumer, null, function(e4) {
      return React14.createElement(z, a({}, i2, { context: e4 }));
    });
  }, r2;
}(e);
W.propTypes = { base: import_prop_types.default.object, bodyAttributes: import_prop_types.default.object, children: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.node), import_prop_types.default.node]), defaultTitle: import_prop_types.default.string, defer: import_prop_types.default.bool, encodeSpecialCharacters: import_prop_types.default.bool, htmlAttributes: import_prop_types.default.object, link: import_prop_types.default.arrayOf(import_prop_types.default.object), meta: import_prop_types.default.arrayOf(import_prop_types.default.object), noscript: import_prop_types.default.arrayOf(import_prop_types.default.object), onChangeClientState: import_prop_types.default.func, script: import_prop_types.default.arrayOf(import_prop_types.default.object), style: import_prop_types.default.arrayOf(import_prop_types.default.object), title: import_prop_types.default.string, titleAttributes: import_prop_types.default.object, titleTemplate: import_prop_types.default.string, prioritizeSeoTags: import_prop_types.default.bool, helmetData: import_prop_types.default.object }, W.defaultProps = { defer: true, encodeSpecialCharacters: true, prioritizeSeoTags: false }, W.displayName = "Helmet";
function Head(props) {
  return /* @__PURE__ */ React14.createElement(W, { ...props });
}
const {
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} = React14;
const { createContext } = React14;
function createNamedContext(name, defaultValue) {
  if (process.env.NODE_ENV === "production") {
    return createContext(defaultValue);
  }
  name = `__rakkasjs_context_${name}__`;
  const existing = globalThis[name];
  if (existing) {
    return existing;
  }
  const context = createContext(defaultValue);
  globalThis[name] = context;
  return context;
}
var IsomorphicContext = createNamedContext(
  "IsomorphicContext",
  void 0
);
var ServerSideContext = createNamedContext(
  "ServerSideContext",
  void 0
);
var EventStreamContentType = "text/event-stream";
var QueryCacheContext = createNamedContext(
  "QueryCacheContext",
  void 0
);
var DEFAULT_QUERY_OPTIONS = {
  cacheTime: 5 * 60 * 1e3,
  staleTime: 100,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchInterval: false,
  refetchIntervalInBackground: false,
  refetchOnReconnect: false
};
function usePageContext() {
  return useContext(IsomorphicContext);
}
function useQuery(key, fn, options = {}) {
  const fullOptions = { ...DEFAULT_QUERY_OPTIONS, ...options };
  const result = useQueryBase(key, fn, fullOptions);
  useRefetch(result, fullOptions);
  return result;
}
function useQueryBase(key, fn, options) {
  const { cacheTime, staleTime, refetchOnMount } = options;
  const cache2 = useContext(QueryCacheContext);
  const item = useSyncExternalStore(
    (onStoreChange) => {
      if (key !== void 0) {
        return cache2.subscribe(key, () => {
          onStoreChange();
        });
      } else {
        return () => {
        };
      }
    },
    () => key === void 0 ? void 0 : cache2.get(key),
    () => key === void 0 ? void 0 : cache2.get(key)
  );
  const ctx = usePageContext();
  useEffect(() => {
    const cacheItem = key ? cache2.get(key) : void 0;
    if (cacheItem === void 0) {
      return;
    }
    if ((cacheItem.invalid || refetchOnMount && (refetchOnMount === "always" || !cacheItem.date || staleTime <= Date.now() - cacheItem.date)) && !cacheItem.promise && !cacheItem.hydrated) {
      const promiseOrValue = fn(ctx);
      cache2.set(key, promiseOrValue, cacheTime);
    }
    cacheItem.hydrated = false;
  }, [key, item == null ? void 0 : item.invalid]);
  const queryResultReference = useMemo(() => ({}), []);
  if (key === void 0) {
    return;
  }
  function refetch() {
    const item2 = cache2.get(key);
    if (!(item2 == null ? void 0 : item2.promise)) {
      cache2.set(key, fn(ctx), cacheTime);
    }
  }
  if (item && "value" in item) {
    return Object.assign(queryResultReference, {
      data: item.value,
      isRefetching: !!item.promise,
      refetch,
      dataUpdatedAt: item.date
    });
  }
  if (item == null ? void 0 : item.promise) {
    throw item.promise;
  }
  const result = fn(ctx);
  cache2.set(key, result, cacheTime);
  if (result instanceof Promise) {
    throw result;
  }
  return Object.assign(queryResultReference, {
    data: result,
    refetch,
    isRefetching: false,
    dataUpdatedAt: (item == null ? void 0 : item.date) ?? Date.now()
  });
}
function useRefetch(queryResult, options) {
  const {
    refetchOnWindowFocus,
    refetchInterval,
    refetchIntervalInBackground,
    staleTime,
    refetchOnReconnect
  } = options;
  useEffect(() => {
    if (!queryResult || !refetchOnWindowFocus)
      return;
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && (refetchOnWindowFocus === "always" || !queryResult.dataUpdatedAt || staleTime <= Date.now() - queryResult.dataUpdatedAt)) {
        queryResult.refetch();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [refetchOnWindowFocus, queryResult, staleTime]);
  useEffect(() => {
    if (!refetchInterval || !queryResult)
      return;
    const id = setInterval(() => {
      if (refetchIntervalInBackground || document.visibilityState === "visible") {
        queryResult.refetch();
      }
    }, refetchInterval);
    return () => {
      clearInterval(id);
    };
  }, [refetchInterval, refetchIntervalInBackground, queryResult]);
  useEffect(() => {
    if (!refetchOnReconnect || !queryResult)
      return;
    function handleReconnect() {
      queryResult.refetch();
    }
    window.addEventListener("online", handleReconnect);
    return () => {
      window.removeEventListener("online", handleReconnect);
    };
  }, [refetchOnReconnect, queryResult]);
}
function createQueryClient(cache2) {
  return {
    getQueryData(key) {
      var _a;
      return (_a = cache2.get(key)) == null ? void 0 : _a.value;
    },
    setQueryData(key, data) {
      if (data instanceof Promise) {
        throw new TypeError("data must be synchronous");
      }
      cache2.set(key, data);
    },
    prefetchQuery(key, data) {
      cache2.set(key, data);
    },
    invalidateQueries(keys) {
      if (typeof keys === "string") {
        cache2.invalidate(keys);
        return;
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => cache2.invalidate(key));
        return;
      }
      for (const key of cache2.enumerate()) {
        const shouldInvalidate = keys === void 0 || keys(key);
        if (shouldInvalidate) {
          cache2.invalidate(key);
        }
      }
    }
  };
}
const {
  forwardRef,
  useCallback,
  useContext: useContext2,
  useDeferredValue,
  useEffect: useEffect2,
  useMemo: useMemo2,
  useState: useState3,
  useSyncExternalStore: useSyncExternalStore2,
  startTransition
} = React14;
var lastRenderedId;
var navigationPromise;
var navigationResolve;
var previousNavigationIndex;
var currentNavigationIndex = 0;
function useLocation() {
  const staticLocation = useContext2(LocationContext);
  const ssrLocation = JSON.stringify([staticLocation, 0]);
  const currentLocationId = useSyncExternalStore2(
    subscribeToLocation,
    getLocationSnapshot,
    useCallback(() => ssrLocation, [ssrLocation])
  );
  const deferredLocationId = useDeferredValue(currentLocationId);
  const [currentLocation] = JSON.parse(currentLocationId);
  const [deferredLocation] = JSON.parse(deferredLocationId);
  useEffect2(() => {
    base.href = deferredLocation;
    lastRenderedId = history.state.id;
    previousNavigationIndex = currentNavigationIndex;
    currentNavigationIndex = history.state.index;
    restoreScrollPosition();
    navigationResolve == null ? void 0 : navigationResolve();
    navigationPromise = void 0;
    navigationResolve = void 0;
  }, [deferredLocationId]);
  const current = useMemo2(() => new URL(deferredLocation), [deferredLocation]);
  const pending = useMemo2(
    () => currentLocationId === deferredLocationId ? void 0 : new URL(currentLocation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocationId, deferredLocationId]
  );
  return {
    current,
    pending
  };
}
function cancelLastNavigation() {
  if (previousNavigationIndex === void 0) {
    throw new Error("No previous navigation to cancel");
  }
  const delta = previousNavigationIndex - currentNavigationIndex;
  history.go(delta);
  currentNavigationIndex = previousNavigationIndex;
  previousNavigationIndex = void 0;
  return () => {
    history.go(-delta);
    previousNavigationIndex = currentNavigationIndex;
    currentNavigationIndex = previousNavigationIndex + delta;
  };
}
function restoreScrollPosition() {
  var _a;
  let scrollPosition = null;
  try {
    scrollPosition = sessionStorage.getItem(`rakkas:${(_a = history.state) == null ? void 0 : _a.id}`);
  } catch {
  }
  if (scrollPosition) {
    const { x: x2, y: y2 } = JSON.parse(scrollPosition);
    scrollTo(x2, y2);
  } else {
    const hash = location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView();
      }
    } else {
      scrollTo(0, 0);
    }
  }
}
async function navigate(to, options) {
  const url = new URL(to, location.href);
  if (url.origin !== location.origin) {
    location.href = url.href;
    return new Promise(() => {
    });
  }
  const { replace, data, actionData } = options || {};
  const id = createUniqueId();
  if (replace) {
    history.replaceState(
      { id, data, actionData, index: history.state.index },
      "",
      to
    );
  } else {
    const index = ++nextIndex;
    history.pushState({ id, data, actionData, index }, "", to);
  }
  navigationPromise = navigationPromise || new Promise((resolve) => {
    navigationResolve = resolve;
  });
  handleNavigation();
  return navigationPromise.then(() => history.state.id === history.state.id);
}
var LocationContext = createNamedContext(
  "LocationContext",
  void 0
);
var locationChangeListeners = /* @__PURE__ */ new Set();
function subscribeToLocation(onStoreChange) {
  locationChangeListeners.add(onStoreChange);
  return () => locationChangeListeners.delete(onStoreChange);
}
var lastLocation;
function getLocationSnapshot() {
  return JSON.stringify(lastLocation);
}
var base;
async function handleNavigation() {
  const scrollPosition = { x: scrollX, y: scrollY };
  try {
    sessionStorage.setItem(
      `rakkas:${lastRenderedId}`,
      JSON.stringify(scrollPosition)
    );
  } catch {
  }
  startTransition(() => {
    locationChangeListeners.forEach((listener) => listener());
    window.$RAKKAS_UPDATE();
  });
}
function createUniqueId() {
  return Math.random().toString(36).slice(2, 9);
}
var nextIndex = 0;
var Link = forwardRef(
  ({
    onClick,
    historyState,
    noScroll,
    replaceState,
    onNavigationStart,
    ...props
  }, ref) => /* @__PURE__ */ React14.createElement(
    "a",
    {
      ...props,
      ref,
      onClick: (e2) => {
        onClick == null ? void 0 : onClick(e2);
        if (!shouldHandleClick(e2)) {
          return;
        }
        onNavigationStart == null ? void 0 : onNavigationStart();
        navigate(e2.currentTarget.href, {
          data: historyState,
          replace: replaceState,
          scroll: !noScroll
        });
        e2.preventDefault();
      }
    }
  )
);
Link.displayName = "Link";
var StyledLink = forwardRef(
  ({
    activeClass,
    pendingClass,
    pendingStyle,
    activeStyle,
    onCompareUrls = defaultCompareUrls,
    onNavigationStart,
    className,
    style,
    ...props
  }, ref) => {
    const [navigating, setNavigating] = useState3(false);
    const { current, pending } = useLocation();
    const hasPending = !!pending;
    useEffect2(() => {
      if (!hasPending) {
        setNavigating(false);
      }
    }, [hasPending]);
    const classNames = className ? [className] : [];
    if (props.href !== void 0 && (activeClass || pendingClass || activeStyle || pendingStyle)) {
      const url = new URL(props.href, current);
      if (navigating) {
        if (pendingClass)
          classNames.push(pendingClass);
        if (pendingStyle)
          style = { ...style, ...pendingStyle };
      }
      if (current && onCompareUrls(new URL(current), url)) {
        if (activeClass)
          classNames.push(activeClass);
        if (activeStyle)
          style = { ...style, ...activeStyle };
      }
    }
    return /* @__PURE__ */ React14.createElement(
      Link,
      {
        ...props,
        ref,
        className: classNames.join(" ") || void 0,
        style,
        onNavigationStart: () => {
          setNavigating(true);
          onNavigationStart == null ? void 0 : onNavigationStart();
        }
      }
    );
  }
);
StyledLink.displayName = "StyledLink";
function defaultCompareUrls(a2, b2) {
  return a2.href === b2.href;
}
function shouldHandleClick(e2) {
  const t2 = e2.currentTarget;
  return (t2 instanceof HTMLAnchorElement || t2 instanceof SVGAElement || t2 instanceof HTMLAreaElement) && !e2.defaultPrevented && t2.href !== void 0 && e2.button === 0 && !e2.shiftKey && !e2.altKey && !e2.ctrlKey && !e2.metaKey && (!t2.target || t2.target === "_self") && !t2.hasAttribute("download") && !t2.relList.contains("external");
}
createNamedContext("ClientOnlyContext", void 0);
const {
  useContext: useContext4,
  useLayoutEffect,
  useRef: useRef2
} = React14;
function escapeJson(json) {
  return json.replace(/</g, "\\u003c");
}
function encodeFileNameSafe(s2) {
  return Array.from(new TextEncoder().encode(s2)).map(
    (x2) => (x2 < 48 || x2 > 57) && (x2 < 97 || x2 > 122) ? "_" + x2.toString(16).toUpperCase().padStart(2, "0") : String.fromCharCode(x2)
  ).join("");
}
function decodeFileNameSafe(s2) {
  return decodeURIComponent(s2.replace(/_/g, "%"));
}
var Redirect = function Redirect2(props) {
  const redirect = useContext4(ResponseContext);
  redirect({
    redirect: true,
    status: props.status || (props.permanent ? 301 : 302),
    headers: { location: props.href }
  });
  return /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement(
    "script",
    {
      dangerouslySetInnerHTML: {
        __html: `window.location.href=${escapeJson(
          JSON.stringify(props.href)
        )};`
      }
    }
  ));
};
var ResponseContext = createNamedContext("ResponseContext", () => void 0);
function _setPrototypeOf(o2, p2) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o3, p3) {
    o3.__proto__ = p3;
    return o3;
  };
  return _setPrototypeOf(o2, p2);
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}
var changedArray = function changedArray2(a2, b2) {
  if (a2 === void 0) {
    a2 = [];
  }
  if (b2 === void 0) {
    b2 = [];
  }
  return a2.length !== b2.length || a2.some(function(item, index) {
    return !Object.is(item, b2[index]);
  });
};
var initialState = {
  error: null
};
var ErrorBoundary = /* @__PURE__ */ function(_React$Component) {
  _inheritsLoose(ErrorBoundary3, _React$Component);
  function ErrorBoundary3() {
    var _this;
    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }
    _this = _React$Component.call.apply(_React$Component, [this].concat(_args)) || this;
    _this.state = initialState;
    _this.resetErrorBoundary = function() {
      var _this$props;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this.props.onReset == null ? void 0 : (_this$props = _this.props).onReset.apply(_this$props, args);
      _this.reset();
    };
    return _this;
  }
  ErrorBoundary3.getDerivedStateFromError = function getDerivedStateFromError(error) {
    return {
      error
    };
  };
  var _proto = ErrorBoundary3.prototype;
  _proto.reset = function reset() {
    this.setState(initialState);
  };
  _proto.componentDidCatch = function componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) == null ? void 0 : _this$props$onError.call(_this$props2, error, info);
  };
  _proto.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    var error = this.state.error;
    var resetKeys = this.props.resetKeys;
    if (error !== null && prevState.error !== null && changedArray(prevProps.resetKeys, resetKeys)) {
      var _this$props$onResetKe, _this$props3;
      (_this$props$onResetKe = (_this$props3 = this.props).onResetKeysChange) == null ? void 0 : _this$props$onResetKe.call(_this$props3, prevProps.resetKeys, resetKeys);
      this.reset();
    }
  };
  _proto.render = function render() {
    var error = this.state.error;
    var _this$props4 = this.props, fallbackRender = _this$props4.fallbackRender, FallbackComponent = _this$props4.FallbackComponent, fallback = _this$props4.fallback;
    if (error !== null) {
      var _props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (/* @__PURE__ */ React14.isValidElement(fallback)) {
        return fallback;
      } else if (typeof fallbackRender === "function") {
        return fallbackRender(_props);
      } else if (FallbackComponent) {
        return /* @__PURE__ */ React14.createElement(FallbackComponent, _props);
      } else {
        throw new Error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop");
      }
    }
    return this.props.children;
  };
  return ErrorBoundary3;
}(React14.Component);
var queryCache = /* @__PURE__ */ Object.create(null);
function resetErrors() {
  const subscribers = /* @__PURE__ */ new Set();
  for (const key in queryCache) {
    const item = queryCache[key];
    if ("error" in item) {
      delete item.error;
      item.subscribers.forEach((subscriber) => subscribers.add(subscriber));
    }
  }
  subscribers.forEach((subscriber) => subscriber());
}
var ErrorBoundary2 = (props) => /* @__PURE__ */ React14.createElement(
  ErrorBoundary,
  {
    ...props,
    onReset: () => {
      var _a;
      resetErrors();
      (_a = props.onReset) == null ? void 0 : _a.call(props);
    }
  }
);
__toESM(require_stringify(), 1);
const { useContext: useContext5 } = React14;
function useRequestContext() {
  return useContext5(ServerSideContext);
}
var import_stringify2 = __toESM(require_stringify(), 1);
function useSSQImpl(desc, options = {}) {
  const { key: userKey, usePostMethod, ...useQueryOptions } = options;
  const ctx = useRequestContext();
  const [moduleId, counter, closure, fn] = desc;
  const stringified = closure.map((x2) => (0, import_stringify2.stringify)(x2));
  const key = userKey ?? `$ss:${moduleId}:${counter}:${stringified}`;
  return useQuery(
    key,
    () => Promise.resolve(fn(closure, ctx)).then(async (result) => {
      if (process.env.RAKKAS_PRERENDER === "true") {
        let closurePath = stringified.map(encodeFileNameSafe).join("/");
        if (closurePath)
          closurePath = "/" + closurePath;
        const url = `/_data/${"b067eefb184"}/` + moduleId + "/" + counter + closurePath + "/d.js";
        await ctx.platform.render(
          url,
          new Response(uneval(result)),
          ctx.platform.prerenderOptions
        );
      }
      return result;
    }),
    useQueryOptions
  );
}
var composableActionData = /* @__PURE__ */ new WeakMap();
var useServerSideQuery = useSSQImpl;
function findPage(routes, path, pageContext) {
  let originalHref = pageContext == null ? void 0 : pageContext.url.href;
  let rewritten;
  do {
    rewritten = false;
    outer:
      for (const route of routes) {
        const re = route[0];
        const match = path.match(re);
        if (!match)
          continue;
        const params = unescapeParams(match.groups || {}, route[3]);
        if (pageContext) {
          const guards = route[2] || [];
          const guardContext = {
            ...pageContext,
            params
          };
          for (const guard of guards) {
            const result = guard(guardContext);
            if (!result) {
              continue outer;
            } else if (result === true) {
              continue;
            } else if ("rewrite" in result) {
              rewritten = true;
              pageContext.url = new URL(result.rewrite, originalHref);
              originalHref = pageContext.url.href;
              path = pageContext.url.pathname;
              break outer;
            } else {
              return result;
            }
          }
        }
        return {
          route,
          params
        };
      }
  } while (rewritten);
}
function unescapeParams(params, rest) {
  for (const [key, value] of Object.entries(params)) {
    if (key === rest)
      continue;
    params[key] = decodeURIComponent(value);
  }
  return params;
}
async function renderApiRoute(ctx) {
  const apiRoutes = await import("./assets/virtual_rakkasjs_api-routes-0ddd5063.js");
  for (const [regex, importers, rest] of apiRoutes.default) {
    const match = regex.exec(ctx.url.pathname);
    if (!match)
      continue;
    ctx.params = unescapeParams(match.groups || {}, rest);
    const [endpointImporter, ...middlewareImporters] = importers;
    let endpoint = await endpointImporter();
    if (endpoint.default)
      endpoint = endpoint.default;
    let method = ctx.method.toLowerCase();
    if (method === "delete")
      method = "del";
    const endpointHandler = endpoint[method] || endpoint.all;
    if (!endpointHandler)
      return;
    const middlewares = await Promise.all(
      middlewareImporters.map(
        (importer) => importer().then((module) => module.default)
      )
    );
    const handler = composePartial([...middlewares, endpointHandler], ctx.next);
    return handler(ctx);
  }
}
const { Fragment: Fragment2, StrictMode, Suspense: Suspense2 } = React14;
const {
  Fragment,
  useContext: useContext6,
  useReducer
} = React14;
function Default404Page() {
  return /* @__PURE__ */ React14.createElement(React14.Fragment, null, /* @__PURE__ */ React14.createElement(Head, { title: "Not Found" }), /* @__PURE__ */ React14.createElement("h1", null, "Not Found"));
}
function App(props) {
  const { current: url } = useLocation();
  const lastRoute = useContext6(RouteContext);
  const [updateCounter, update] = useReducer(
    (old) => old + 1 & 268435455,
    0
  );
  const forcedUpdate = (lastRoute.updateCounter || 0) !== updateCounter;
  const actionData = props.ssrActionData;
  const pageContext = useContext6(IsomorphicContext);
  pageContext.url = new URL(url);
  pageContext.actionData = actionData;
  if ("error" in lastRoute) {
    throw lastRoute.error;
  }
  if (!lastRoute.last || lastRoute.last.pathname !== pageContext.url.pathname || lastRoute.last.search !== pageContext.url.search || // lastRoute.last.actionData !== actionData ||
  forcedUpdate) {
    lastRoute.updateCounter = updateCounter;
    throw loadRoute(
      pageContext,
      lastRoute.found,
      false,
      props.beforePageLookupHandlers,
      actionData,
      props.ssrMeta,
      props.ssrPreloaded,
      props.ssrModules
    ).then((route) => {
      var _a;
      lastRoute.last = route;
      (_a = lastRoute.onRendered) == null ? void 0 : _a.call(lastRoute);
    }).catch(async () => {
      window.location.reload();
      await new Promise(() => {
      });
    });
  }
  const app = lastRoute.last.app;
  return app;
}
var RouteContext = createNamedContext(
  "RouteContext",
  {
    updateCounter: 0
  }
);
async function loadRoute(pageContext, lastFound, try404, beforePageLookupHandlers, actionData, ssrMeta, ssrPreloaded, ssrModules) {
  let found = lastFound;
  const { pathname: originalPathname } = pageContext.url;
  for (const hook of beforePageLookupHandlers) {
    const result = hook(pageContext, pageContext.url);
    if (!result)
      break;
    if (result === true)
      continue;
    if ("redirect" in result) {
      const location2 = String(result.redirect);
      return {
        pathname: originalPathname,
        search: pageContext.url.search,
        actionData,
        app: /* @__PURE__ */ React14.createElement(
          Redirect,
          {
            href: location2,
            status: result.status,
            permanent: result.permanent
          }
        )
      };
    } else {
      pageContext.url = new URL(result.rewrite, pageContext.url);
    }
  }
  if (!found || void 0) {
    let routes;
    {
      routes = prodRoutes;
    }
    let pathname = pageContext.url.pathname;
    let result = findPage(routes, pathname, pageContext);
    if (result && "redirect" in result) {
      const location2 = String(result.redirect);
      return {
        pathname: originalPathname,
        search: pageContext.url.search,
        actionData,
        app: /* @__PURE__ */ React14.createElement(
          Redirect,
          {
            href: location2,
            status: result.status,
            permanent: result.permanent
          }
        )
      };
    }
    found = result;
    while (!found) {
      if (!try404) {
        cancelLastNavigation();
        await new Promise((resolve) => {
          window.addEventListener("popstate", resolve, { once: true });
        });
        location.assign(pageContext.url.href);
        await new Promise(() => {
        });
      }
      if (!pathname.endsWith("/")) {
        pathname += "/";
      }
      const result2 = findPage(routes, pathname + "%24404");
      found = result2;
      if (!found && pathname === "/") {
        found = {
          params: {},
          route: [
            /^\/$/,
            [async () => ({ default: Default404Page })],
            [],
            void 0,
            []
          ]
        };
      }
      pathname = pathname.split("/").slice(0, -2).join("/") || "/";
    }
  }
  const importers = found.route[1];
  const preloadContext = {
    ...pageContext,
    params: found.params
  };
  const promises = importers.map(
    async (importer, i2) => Promise.resolve((ssrModules == null ? void 0 : ssrModules[importers.length - 1 - i2]) || importer()).then(
      async (module) => {
        var _a;
        const preload = (_a = module.default) == null ? void 0 : _a.preload;
        try {
          if (false)
            ;
          const preloaded = (ssrPreloaded == null ? void 0 : ssrPreloaded[i2]) ?? await (preload == null ? void 0 : preload(preloadContext));
          return [module.default, preloaded];
        } catch (preloadError) {
          return [
            () => {
              throw preloadError;
            }
          ];
        }
      }
    )
  );
  const layoutStack = await Promise.all(promises);
  let meta;
  let preloadNode = [];
  {
    meta = ssrMeta;
  }
  const components = layoutStack.map(
    (m2) => m2[0] || (({ children }) => children)
  );
  let app = components.reduce(
    (prev, Component2) => /* @__PURE__ */ React14.createElement(
      Component2,
      {
        url: pageContext.url,
        params: found.params,
        meta,
        actionData
      },
      prev
    ),
    null
  );
  if (preloadNode.length) {
    app = /* @__PURE__ */ React14.createElement(React14.Fragment, null, preloadNode, app);
  }
  return {
    pathname: originalPathname,
    search: pageContext.url.search,
    actionData,
    app
  };
}
var BOT_REGEX = /bot|check|cloud|crawler|curl|download|facebookexternalhit|flipboard|google|heritrix|ia_archiver|monitor|perl|preview|python|qwantify|scan|spider|tumblr|vkshare|wget|whatsapp|yahoo/i;
function isBot(agent) {
  return BOT_REGEX.test(agent);
}
var pageContextMap = /* @__PURE__ */ new WeakMap();
async function renderPageRoute(ctx) {
  var _a, _b, _c, _d;
  if (ctx.method === "POST" && ctx.url.searchParams.get("_action")) {
    return;
  }
  const pageHooks = ctx.hooks.map((hook) => {
    var _a2;
    return (_a2 = hook.createPageHooks) == null ? void 0 : _a2.call(hook, ctx);
  });
  const routes = (await import("./assets/virtual_rakkasjs_server-page-routes-f8d2710c.js")).default;
  let {
    url: { pathname }
  } = ctx;
  let pageContext = pageContextMap.get(ctx.request);
  if (!pageContext) {
    pageContext = { url: ctx.url, locals: {} };
    for (const hook of pageHooks) {
      await ((_a = hook == null ? void 0 : hook.extendPageContext) == null ? void 0 : _a.call(hook, pageContext));
    }
    await ((_b = commonHooks.extendPageContext) == null ? void 0 : _b.call(commonHooks, pageContext));
    pageContextMap.set(ctx.request, pageContext);
  }
  let found;
  const beforePageLookupHandlers = [commonHooks.beforePageLookup].filter(Boolean);
  if (ctx.notFound) {
    do {
      if (!pathname.endsWith("/")) {
        pathname += "/";
      }
      found = findPage(routes, pathname + "%24404");
      if (found) {
        break;
      }
      if (pathname === "/") {
        found = {
          params: {},
          route: [
            /^\/$/,
            [async () => ({ default: Default404Page })],
            [],
            void 0,
            []
          ]
        };
      }
      pathname = pathname.split("/").slice(0, -2).join("/") || "/";
    } while (!found);
  } else {
    for (const hook of beforePageLookupHandlers) {
      const result2 = hook(pageContext, pageContext.url);
      if (!result2)
        return;
      if (result2 === true)
        continue;
      if ("redirect" in result2) {
        const location2 = String(result2.redirect);
        return new Response(redirectBody(location2), {
          status: result2.status ?? result2.permanent ? 301 : 302,
          headers: makeHeaders(
            {
              location: new URL(location2, ctx.url.origin).href,
              "content-type": "text/html; charset=utf-8",
              vary: "accept"
            },
            result2.headers
          )
        });
      } else {
        pageContext.url = new URL(result2.rewrite, pageContext.url);
      }
    }
    pathname = pageContext.url.pathname;
    const result = findPage(routes, pathname, pageContext);
    if (result && "redirect" in result) {
      const location2 = String(result.redirect);
      return new Response(redirectBody(location2), {
        status: result.status ?? result.permanent ? 301 : 302,
        headers: makeHeaders(
          {
            location: new URL(location2, ctx.url.origin).href,
            "content-type": "text/html; charset=utf-8",
            vary: "accept"
          },
          result.headers
        )
      });
    }
    found = result;
    if (!found)
      return;
  }
  const renderMode = ["hydrate", "server", "client"][found.route[5] ?? 0];
  const dataOnly = ctx.request.headers.get("accept") === "application/javascript";
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    vary: "accept"
  });
  let scriptPath;
  {
    for (const entry of Object.values(clientManifest)) {
      if (entry.isEntry) {
        scriptPath = entry.file;
        break;
      }
    }
    if (!scriptPath)
      throw new Error("Entry not found in client manifest");
  }
  if (renderMode === "client" && ctx.method === "GET" && !dataOnly) {
    const prefetchOutput2 = `<script type="module" async src="/${scriptPath}"><\/script>`;
    const head2 = renderHead(prefetchOutput2, renderMode);
    const html = head2 + `<div id="root"></div></body></html>`;
    return new Response(html, {
      status: 200,
      headers
    });
  }
  let redirected;
  let status;
  let hold = process.env.RAKKAS_PRERENDER === "true" || true ? true : 0;
  function updateHeaders(props) {
    if (props.status) {
      status = typeof props.status === "function" ? props.status(status) : props.status;
    }
    if (hold !== true && false) {
      hold = props.throttleRenderStream;
    }
    if (typeof props.headers === "function") {
      props.headers(headers);
    } else if (props.headers) {
      for (const [key, value] of Object.entries(props.headers)) {
        const values = Array.isArray(value) ? value : [value];
        for (const v2 of values) {
          headers.append(key, v2);
        }
      }
    }
    if (props.redirect) {
      redirected = redirected ?? props.redirect;
      reactStream.cancel();
    }
  }
  const importers = found.route[1];
  const preloadContext = {
    ...pageContext,
    params: found.params
  };
  const modules = await Promise.all(importers.map((importer) => importer()));
  let actionResult;
  let actionErrorIndex = -1;
  let actionError;
  if (ctx.method !== "GET") {
    for (const [i2, module] of modules.entries()) {
      if (module.action) {
        try {
          actionResult = await module.action(preloadContext);
        } catch (error) {
          actionError = error;
          actionErrorIndex = i2;
        }
        break;
      }
    }
  }
  if (dataOnly) {
    if (actionResult && "redirect" in actionResult) {
      actionResult.redirect = String(actionResult.redirect);
    }
    return new Response(uneval(actionResult), {
      status: actionErrorIndex >= 0 ? 500 : (actionResult == null ? void 0 : actionResult.status) ?? 200,
      headers: makeHeaders(
        {
          "content-type": "application/javascript",
          vary: "accept"
        },
        actionResult == null ? void 0 : actionResult.headers
      )
    });
  }
  if (actionResult && "redirect" in actionResult) {
    const location2 = String(actionResult.redirect);
    return new Response(redirectBody(location2), {
      status: actionResult.status ?? actionResult.permanent ? 301 : 302,
      headers: makeHeaders(
        {
          location: new URL(location2, ctx.url.origin).href,
          "content-type": "text/html; charset=utf-8",
          vary: "accept"
        },
        actionResult.headers
      )
    });
  }
  status = (actionResult == null ? void 0 : actionResult.status) ?? (ctx.notFound ? 404 : 200);
  pageContext.actionData = actionResult == null ? void 0 : actionResult.data;
  preloadContext.actionData = actionResult == null ? void 0 : actionResult.data;
  const reverseModules = modules.reverse();
  const preloaded = await Promise.all(
    reverseModules.map(async (m2, i2) => {
      var _a2, _b2;
      try {
        if (i2 === modules.length - 1 - actionErrorIndex) {
          throw new Error(actionError);
        }
        const preloaded2 = await ((_b2 = (_a2 = m2.default) == null ? void 0 : _a2.preload) == null ? void 0 : _b2.call(_a2, preloadContext));
        return preloaded2;
      } catch (preloadError) {
        modules[i2] = {
          default() {
            throw preloadError;
          }
        };
      }
    })
  );
  const meta = {};
  preloaded.forEach((p2) => Object.assign(meta, p2 == null ? void 0 : p2.meta));
  const preloadNode = preloaded.map((result, i2) => {
    return ((result == null ? void 0 : result.head) || (result == null ? void 0 : result.redirect)) && /* @__PURE__ */ React14.createElement(Fragment2, { key: i2 }, result == null ? void 0 : result.head, (result == null ? void 0 : result.redirect) && /* @__PURE__ */ React14.createElement(Redirect, { ...result == null ? void 0 : result.redirect }));
  }).filter(Boolean);
  let app = /* @__PURE__ */ React14.createElement(
    App,
    {
      beforePageLookupHandlers,
      ssrActionData: actionResult == null ? void 0 : actionResult.data,
      ssrMeta: meta,
      ssrPreloaded: preloaded,
      ssrModules: modules
    }
  );
  if (preloadNode.length) {
    app = /* @__PURE__ */ React14.createElement(React14.Fragment, null, preloadNode, app);
  }
  if (commonHooks.wrapApp) {
    app = commonHooks.wrapApp(app);
  }
  const reversePageHooks = [...pageHooks].reverse();
  for (const hooks of reversePageHooks) {
    if (hooks == null ? void 0 : hooks.wrapApp) {
      app = hooks.wrapApp(app);
    }
  }
  app = /* @__PURE__ */ React14.createElement(ServerSideContext.Provider, { value: ctx }, /* @__PURE__ */ React14.createElement(IsomorphicContext.Provider, { value: pageContext }, app));
  let resolveRenderPromise;
  let rejectRenderPromise;
  const renderPromise = new Promise((resolve, reject) => {
    resolveRenderPromise = resolve;
    rejectRenderPromise = reject;
  });
  for (const m2 of modules) {
    const headers2 = await ((_c = m2.headers) == null ? void 0 : _c.call(m2, preloadContext, meta));
    if (headers2) {
      updateHeaders(headers2);
    }
    if (process.env.RAKKAS_PRERENDER === "true") {
      let prerender2 = { links: [] };
      for (const m3 of modules) {
        const value = await ((_d = m3.prerender) == null ? void 0 : _d.call(m3, preloadContext, meta));
        if (value) {
          prerender2 = {
            ...prerender2,
            ...value,
            links: [...prerender2.links, ...value.links ?? []]
          };
        }
      }
      ctx.platform.prerenderOptions = prerender2;
    }
  }
  app = /* @__PURE__ */ React14.createElement("div", { id: "root" }, /* @__PURE__ */ React14.createElement(ResponseContext.Provider, { value: updateHeaders }, /* @__PURE__ */ React14.createElement(
    RouteContext.Provider,
    {
      value: {
        onRendered() {
          resolveRenderPromise();
        },
        found
      }
    },
    /* @__PURE__ */ React14.createElement(Suspense2, null, app)
  )));
  const reactStream = await renderToReadableStream(app, {
    // TODO: AbortController
    bootstrapModules: renderMode === "server" ? [] : ["/" + scriptPath],
    onError(error) {
      if (!redirected) {
        status = 500;
        if (error && typeof error.toResponse === "function") {
          Promise.resolve(error.toResponse()).then((response) => {
            status = response.status;
          });
        } else if (process.env.RAKKAS_PRERENDER) {
          ctx.platform.reportError(error);
        } else {
          console.error(error);
        }
      }
      rejectRenderPromise(error);
    }
  });
  try {
    await renderPromise;
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    const userAgent = ctx.request.headers.get("user-agent");
    if (hold === true || userAgent && isBot(userAgent)) {
      await reactStream.allReady;
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    } else if (hold > 0) {
      await Promise.race([
        reactStream.allReady,
        new Promise((resolve) => {
          setTimeout(resolve, hold);
        })
      ]);
    }
  } catch (error) {
    if (!redirected) {
      if (error && typeof error.toResponse === "function") {
        const response = await error.toResponse();
        status = response.status;
      } else if (process.env.RAKKAS_PRERENDER) {
        ctx.platform.reportError(error);
      } else {
        console.error(error);
        status = 500;
      }
    }
  }
  if (redirected) {
    return new Response(redirectBody(headers.get("location")), {
      status,
      headers
    });
  }
  const prefetchOutput = createPrefetchTags(
    ctx.url,
    [scriptPath, ...found.route[4]],
    renderMode === "server"
  );
  const head = renderHead(
    prefetchOutput,
    renderMode,
    actionResult == null ? void 0 : actionResult.data,
    actionErrorIndex,
    pageHooks
  );
  let wrapperStream = reactStream;
  for (const hooks of pageHooks) {
    if (hooks == null ? void 0 : hooks.wrapSsrStream) {
      wrapperStream = hooks.wrapSsrStream(wrapperStream);
    }
  }
  const textEncoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const bufferedChunks = [];
  const writer = hold === true ? {
    write(chunk) {
      bufferedChunks.push(chunk);
    },
    close() {
    }
  } : writable.getWriter();
  async function pipe() {
    writer.write(textEncoder.encode(head));
    for await (const chunk of wrapperStream) {
      for (const hooks of pageHooks) {
        if (hooks == null ? void 0 : hooks.emitBeforeSsrChunk) {
          const text = hooks.emitBeforeSsrChunk();
          if (text) {
            writer.write(textEncoder.encode(text));
          }
        }
      }
      writer.write(chunk);
    }
    writer.write(textEncoder.encode("</body></html>"));
    writer.close();
  }
  const pipePromise = pipe();
  if (hold === true) {
    await pipePromise;
    const output = new Uint8Array(
      bufferedChunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of bufferedChunks) {
      output.set(chunk, offset);
      offset += chunk.length;
    }
    return new Response(output, { status, headers });
  }
  ctx.waitUntil(pipePromise);
  return new Response(readable, { status, headers });
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function redirectBody(href) {
  const escaped = escapeHtml(href);
  return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${escaped}"></head><body><a href="${escaped}">${escaped}</a></body></html>`;
}
function makeHeaders(init2, headers) {
  const result = new Headers(init2);
  if (typeof headers === "function") {
    headers(result);
  } else if (headers) {
    for (const [header, value] of Object.entries(headers)) {
      if (Array.isArray(value)) {
        for (const v2 of value) {
          result.append(header, v2);
        }
      } else {
        result.set(header, value);
      }
    }
  }
  return result;
}
function createPrefetchTags(pageUrl, moduleIds, server) {
  var _a, _b;
  let result = "";
  {
    const moduleSet = new Set(moduleIds);
    const cssSet = /* @__PURE__ */ new Set();
    for (const moduleId of moduleSet) {
      const manifestEntry = clientManifest == null ? void 0 : clientManifest[moduleId];
      if (!manifestEntry)
        continue;
      (_a = manifestEntry.imports) == null ? void 0 : _a.forEach((id) => moduleSet.add(id));
      (_b = manifestEntry.css) == null ? void 0 : _b.forEach((id) => cssSet.add(id));
      const script = clientManifest == null ? void 0 : clientManifest[moduleId].file;
      if (script && server) {
        result += `<link rel="modulepreload" crossorigin href="${escapeHtml(
          "/" + script
        )}">`;
      }
    }
    for (const cssFile of cssSet) {
      result += `<link rel="stylesheet" href="${escapeHtml("/" + cssFile)}">`;
    }
  }
  return result;
}
function renderHead(prefetchOutput, renderMode, actionData = void 0, actionErrorIndex = -1, pageHooks = []) {
  let result = `<!DOCTYPE html><html><head>` + prefetchOutput + `<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />` + (renderMode === "hydrate" ? `<script>$RAKKAS_HYDRATE="hydrate"<\/script>` : "") + // TODO: Refactor this. Probably belongs to client-side-navigation
  (actionData === void 0 && renderMode !== "server" ? "" : `<script>$RAKKAS_ACTION_DATA=${uneval(actionData)}<\/script>`);
  if (actionErrorIndex >= 0 && renderMode !== "server") {
    result += `<script>$RAKKAS_ACTION_ERROR_INDEX=${actionErrorIndex}<\/script>`;
  }
  for (const hooks of pageHooks) {
    if (hooks == null ? void 0 : hooks.emitToDocumentHead) {
      result += hooks.emitToDocumentHead();
    }
  }
  result += `</head><body>`;
  return result;
}
var headServerHooks = {
  createPageHooks() {
    const helmetContext = {};
    return {
      wrapApp: (app) => {
        return /* @__PURE__ */ React14.createElement(q, { context: helmetContext }, app);
      },
      emitToDocumentHead() {
        const { helmet } = helmetContext;
        return helmet.title.toString() + helmet.priority.toString() + helmet.meta.toString() + helmet.base.toString() + helmet.link.toString() + helmet.style.toString() + helmet.script.toString() + helmet.noscript.toString();
      }
    };
  }
};
var server_hooks_default = headServerHooks;
var useQueryServerHooks = {
  createPageHooks() {
    const cache2 = {
      _items: /* @__PURE__ */ Object.create(null),
      _newItems: /* @__PURE__ */ Object.create(null),
      _hasNewItems: false,
      _errorItems: /* @__PURE__ */ Object.create(null),
      _getNewItems() {
        const items = this._newItems;
        this._newItems = /* @__PURE__ */ Object.create(null);
        this._hasNewItems = false;
        return items;
      },
      has(key) {
        return key in this._items;
      },
      get(key) {
        if (key in this._errorItems) {
          throw this._errorItems[key];
        }
        if (!this.has(key)) {
          return void 0;
        }
        const content = this._items[key];
        const result = content instanceof Promise ? { promise: content } : { value: content };
        return result;
      },
      set(key, valueOrPromise) {
        this._items[key] = valueOrPromise;
        if (valueOrPromise instanceof Promise) {
          valueOrPromise.then(
            (value) => {
              this._items[key] = this._newItems[key] = value;
              this._hasNewItems = true;
            },
            (error) => {
              delete this._items[key];
              this._errorItems[key] = error;
            }
          );
        } else {
          this._newItems[key] = valueOrPromise;
          this._hasNewItems = true;
        }
      },
      subscribe() {
        throw new Error("Cannot subscribe on the server");
      },
      invalidate() {
        throw new Error("Cannot invalidate on the server");
      },
      enumerate() {
        throw new Error("Cannot enumerate on the server");
      }
    };
    return {
      wrapApp: (app) => {
        return /* @__PURE__ */ React14.createElement(QueryCacheContext.Provider, { value: cache2 }, app);
      },
      extendPageContext(ctx) {
        ctx.queryClient = createQueryClient(cache2);
      },
      emitToDocumentHead() {
        const newItemsString = uneval(cache2._getNewItems());
        return `<script>$RSC=${newItemsString}<\/script>`;
      },
      emitBeforeSsrChunk() {
        if (cache2._hasNewItems) {
          const newItemsString = uneval(cache2._getNewItems());
          return `<script>Object.assign($RSC,${newItemsString})<\/script>`;
        }
      }
    };
  }
};
var server_hooks_default2 = useQueryServerHooks;
var import_parse = __toESM(require_parse(), 1);
var runServerSideServerHooks = {
  middleware: {
    beforeApiRoutes: async (ctx) => {
      const prefix = `/_data/`;
      let action = ctx.url.searchParams.get("_action");
      if (!ctx.url.pathname.startsWith(prefix) && !action) {
        return;
      }
      action = action || ctx.url.pathname.slice(prefix.length);
      const [buildId, moduleId, counter, ...closure] = action.split("/");
      if (buildId !== "b067eefb184") {
        return new Response("Outdated client", { status: 404 });
      }
      let closureContents;
      let vars;
      let isFormMutation = true;
      try {
        if (ctx.method === "POST" && ctx.request.headers.get("content-type") === "application/json") {
          isFormMutation = false;
          const text = await ctx.request.text();
          const data = (0, import_parse.parse)(text);
          if (!Array.isArray(data)) {
            return new Response("Parse error", { status: 400 });
          }
          closureContents = data[0];
          if (!Array.isArray(closureContents)) {
            return new Response("Parse error", { status: 400 });
          }
          vars = data[1];
        } else {
          if (ctx.method === "GET") {
            closure.length -= 1;
            isFormMutation = false;
          }
          closureContents = closure.map((s2) => (0, import_parse.parse)(decodeFileNameSafe(s2)));
        }
      } catch (e2) {
        return new Response("Parse error", { status: 400 });
      }
      const manifest = await import("./assets/virtual_rakkasjs_run-server-side_manifest-6f684aca.js");
      const importer = manifest.default[decodeURIComponent(moduleId)];
      if (!importer)
        return;
      const module = await importer();
      if (!module.$runServerSide$)
        return;
      const fn = module.$runServerSide$[Number(counter)];
      const result = await fn(closureContents, ctx, vars);
      if (ctx.request.headers.get("accept") === EventStreamContentType && result instanceof ReadableStream) {
        const { readable, writable } = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(`data: ${uneval(chunk)}

`);
          }
        });
        result.pipeTo(writable);
        return new Response(readable, {
          status: 200,
          headers: {
            "Content-Type": EventStreamContentType,
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
          }
        });
      }
      if (isFormMutation) {
        if (ctx.request.headers.get("accept") === "application/javascript") {
          return new Response(uneval(result));
        } else {
          if (result.redirect) {
            return new Response(null, {
              status: 302,
              headers: {
                location: new URL(result.redirect, ctx.url).href
              }
            });
          }
          ctx.url.searchParams.delete("_action");
          composableActionData.set(ctx, [action, result]);
          return renderPageRoute(ctx);
        }
      }
      return new Response(uneval(result));
    }
  },
  createPageHooks(requestContext) {
    return {
      extendPageContext(pageContext) {
        pageContext.requestContext = requestContext;
      }
    };
  }
};
var server_hooks_default3 = runServerSideServerHooks;
var isomorphicFetchServerHooks = {
  middleware: {
    beforePages: (ctx) => {
      ctx.fetch = async (input, init2) => {
        let url;
        if (!(input instanceof Request)) {
          url = new URL(input, ctx.url);
          input = url.href;
        }
        const newRequest = new Request(input, init2);
        url = url || new URL(newRequest.url, ctx.url);
        const sameOrigin = url.origin === ctx.url.origin;
        let requestCredentials;
        try {
          requestCredentials = (init2 == null ? void 0 : init2.credentials) ?? newRequest.credentials;
        } catch {
        }
        const credentials = requestCredentials ?? (init2 == null ? void 0 : init2.credentials) ?? "same-origin";
        const includeCredentials = credentials === "include" || credentials === "same-origin" && sameOrigin;
        if (includeCredentials) {
          const cookie = ctx.request.headers.get("cookie");
          if (cookie !== null) {
            newRequest.headers.set("cookie", cookie);
          }
          const authorization = ctx.request.headers.get("authorization");
          if (authorization !== null) {
            newRequest.headers.set("authorization", authorization);
          }
        } else {
          newRequest.headers.delete("cookie");
          newRequest.headers.delete("authorization");
        }
        let response;
        if (sameOrigin) {
          response = await hattipHandler({
            request: newRequest,
            ip: ctx.ip,
            waitUntil: ctx.waitUntil,
            passThrough: ctx.passThrough,
            platform: ctx.platform
          });
        }
        return response ?? fetch(newRequest);
      };
    }
  },
  createPageHooks(ctx) {
    return {
      extendPageContext(pageContext) {
        pageContext.fetch = ctx.fetch;
      }
    };
  }
};
var server_hooks_default4 = isomorphicFetchServerHooks;
var clientSideNavigationServerHooks = {
  createPageHooks(ctx) {
    return {
      wrapApp(app) {
        return /* @__PURE__ */ React14.createElement(LocationContext.Provider, { value: ctx.url.href }, app);
      }
    };
  }
};
var server_hooks_default5 = clientSideNavigationServerHooks;
var serverHooks = [
  server_hooks_default,
  server_hooks_default2,
  server_hooks_default3,
  server_hooks_default4,
  server_hooks_default5
];
var feature_server_hooks_default = serverHooks;
function createRequestHandler(userHooks = {}) {
  const hooks = [...feature_server_hooks_default, userHooks];
  return compose(
    [
      process.env.RAKKAS_PRERENDER === "true" && prerender,
      init(hooks),
      hooks.map((hook) => {
        var _a;
        return (_a = hook.middleware) == null ? void 0 : _a.beforePages;
      }).flat(),
      async (ctx) => {
        try {
          return await renderPageRoute(ctx);
        } catch (error) {
          if (!process.env.RAKKAS_PRERENDER) {
            console.error(error);
          }
        }
      },
      hooks.map((hook) => {
        var _a;
        return (_a = hook.middleware) == null ? void 0 : _a.beforeApiRoutes;
      }).flat(),
      renderApiRoute,
      hooks.map((hook) => {
        var _a;
        return (_a = hook.middleware) == null ? void 0 : _a.beforeNotFound;
      }).flat(),
      notFound,
      renderPageRoute
    ].flat()
  );
}
function init(hooks) {
  return (ctx) => {
    ctx.hooks = hooks;
  };
}
function notFound(ctx) {
  ctx.notFound = true;
}
async function prerender(ctx) {
  if (ctx.method !== "GET")
    return;
  let caught;
  ctx.platform.reportError = (error) => {
    caught = error;
  };
  const response = await ctx.next();
  await ctx.platform.render(
    ctx.url.pathname,
    response.clone(),
    ctx.platform.prerenderOptions,
    caught
  );
  return response;
}
/*! Bundled license information:

react-is/cjs/react-is.production.min.js:
  (** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/
const hattipHandler = createRequestHandler();
const entryHattip_default = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: hattipHandler
}, Symbol.toStringTag, { value: "Module" }));
export {
  ErrorBoundary2 as E,
  Head as H,
  Link as L,
  hattipHandler as default,
  entryHattip_default as e,
  useServerSideQuery as u
};
