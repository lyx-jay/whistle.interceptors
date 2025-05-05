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

// src/uiServer/constant.ts
var LOCAL_PREFIX = "whistle.interceptors";

// src/server.ts
function parseQuery(queryString) {
  const params = {};
  const query = queryString.startsWith("?") ? queryString.substring(1) : queryString;
  query.split("&").forEach((item) => {
    const [key, value] = item.split("=");
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
}
function getBody(req) {
  return new Promise((resolve) => {
    req.getReqSession((session) => {
      resolve(JSON.parse(session.req.body));
    });
  });
}
function handleAndMode({ conditions, payload, res }) {
  const isMatch = conditions.every((condition) => {
    const { key, value } = condition;
    return payload[key] && payload[key] === value;
  });
  if (!isMatch) {
    return true;
  }
  res.setHeader("whistle-plugin", "whistle.interceptors");
  res.setHeader("Content-Type", "application/json; charset=UTF-8");
  res.end(conditions[0].response);
}
function handleOrMode({ conditions, payload, res }) {
  const matchingCondition = conditions.find(
    ({ key, value }) => payload[key] === value
  );
  if (!matchingCondition) {
    return true;
  }
  res.setHeader("whistle-plugin", "whistle.interceptors");
  res.setHeader("Content-Type", "application/json; charset=UTF-8");
  res.end(matchingCondition.response);
}
function handleMatchMode({ matchType, conditions, payload, res, req }) {
  const map = {
    "and": handleAndMode,
    "or": handleOrMode
  };
  const noMatch = map[matchType]({
    conditions,
    payload,
    res
  });
  if (noMatch) {
    req.passThrough();
  }
}
var server_default = (server, options) => {
  server.on("request", (req, res) => __async(null, null, function* () {
    try {
      const id = req.originalReq.ruleValue;
      const rules = JSON.parse(options.storage.getProperty(LOCAL_PREFIX)) || [];
      const targetRule = rules.filter((rule) => rule.id === id)[0];
      const { matchType, method, conditions } = targetRule.config;
      if (req.method !== method) {
        req.passThrough();
        return;
      }
      let payLoad;
      if (method === "POST") {
        payLoad = yield getBody(req);
      }
      if (method === "GET") {
        payLoad = parseQuery(options.parseUrl(req.fullUrl).query);
      }
      handleMatchMode({
        matchType,
        conditions,
        res,
        req,
        payload: payLoad
      });
    } catch (error) {
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
