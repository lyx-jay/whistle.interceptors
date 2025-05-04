var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var EXCLUDE_RULES = ["file"];
function handleGlobalValue(globalValue) {
  const rules = globalValue.split("|").map((rule) => {
    const ruleMap = /* @__PURE__ */ new Map();
    const pairs = rule.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      ruleMap.set(key, value);
    });
    return ruleMap;
  });
  return rules;
}
var server_default = (server, options) => {
  server.on("request", (req, res) => __async(null, null, function* () {
    if (req.method === "POST") {
      req.on("data", (chunk) => {
        const reqBody = JSON.parse(chunk.toString());
        const rules = handleGlobalValue(req.originalReq.globalValue);
        for (const ruleMap of rules) {
          const isMatch = Array.from(ruleMap.entries()).every(([key, value]) => {
            if (EXCLUDE_RULES.includes(key)) {
              return true;
            }
            return reqBody[key] && reqBody[key] === value;
          });
          if (isMatch && ruleMap.has("file")) {
            options.getValue(ruleMap.get("file"), (value) => {
              res.end(value);
              return;
            });
          }
        }
        req.passThrough();
      });
    } else {
      req.passThrough();
    }
  }));
  server.on("upgrade", (req, socket) => {
    req.passThrough();
  });
  server.on("connect", (req, socket) => {
    req.passThrough();
  });
};
