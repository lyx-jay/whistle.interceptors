var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/uiServer/index.ts
var uiServer_exports = {};
__export(uiServer_exports, {
  default: () => uiServer_default
});
module.exports = __toCommonJS(uiServer_exports);
var import_koa = __toESM(require("koa"));
var import_koa_bodyparser = __toESM(require("koa-bodyparser"));
var import_cors = __toESM(require("@koa/cors"));
var import_koa_static = __toESM(require("koa-static"));
var import_path = __toESM(require("path"));
var import_koa_router = __toESM(require("koa-router"));

// src/uiServer/constant.ts
var LOCAL_PREFIX = "whistle.interceptors";
var apis = {
  get: "/collections/query",
  add: "/collections/add",
  delete: "/collections/delete"
};

// src/uiServer/router.ts
var router_default = (router) => {
  router.get(apis.get, (ctx) => {
    try {
      const data = ctx.storage.getProperty(LOCAL_PREFIX);
      console.log("get data", data);
      ctx.body = {
        result: "ok",
        data: JSON.parse(data)
      };
    } catch (error) {
      ctx.body = {
        result: "error",
        data: "get rules error " + error
      };
    }
  });
  router.post(apis.add, (ctx) => {
    console.log("ssss", ctx.request.body, typeof ctx.request.body);
    ctx.storage.setProperty(LOCAL_PREFIX, JSON.stringify(ctx.request.body));
    ctx.body = {
      result: "ok",
      data: null
    };
  });
  router.delete(apis.delete, (ctx) => {
    console.log("ssss", ctx);
    ctx.body = "ok";
  });
};

// src/uiServer/index.ts
var MAX_AGE = 1e3 * 60 * 5;
var uiServer_default = (server, options) => {
  const app = new import_koa.default();
  app.context.storage = options.storage;
  app.proxy = true;
  app.silent = true;
  app.use(
    (0, import_cors.default)({
      allowMethods: ["GET", "POST", "PUT", "DELETE"]
    })
  );
  const router = new import_koa_router.default();
  router_default(router);
  app.use((0, import_koa_bodyparser.default)());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use((0, import_koa_static.default)(import_path.default.join(__dirname, "../../public"), { maxage: MAX_AGE }));
  server.on("request", app.callback());
};
