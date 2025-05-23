import Router from "koa-router";
import { apis, LOCAL_PREFIX } from "./constant";

type RouterContext = {
  storage: Whistle.Storage;
} & Router.IRouterContext;

export default (router: Router) => {
  router.get(apis.get, (ctx: RouterContext) => {
    try {
      const data = ctx.storage.getProperty(LOCAL_PREFIX);
      ctx.body = {
        result: "ok",
        data: data ? JSON.parse(data) : [],
      };
    } catch (error) {
      ctx.body = {
        result: "error",
        data: "get rules error " + error,
      };
    }
  });

  router.post(apis.add, (ctx: RouterContext) => {
    console.log("ssss", ctx.request.body, typeof ctx.request.body);
    ctx.storage.setProperty(LOCAL_PREFIX, JSON.stringify(ctx.request.body));
    ctx.body = {
      result: "ok",
      data: null,
    };
  });

  router.delete(apis.delete, (ctx) => {
    console.log("ssss", ctx);
    ctx.body = "ok";
  });

  router.get(apis.sse, (ctx: RouterContext) => {

    const storage_prefix = ctx.query.storage_prefix as string

    ctx.set("Content-Type", "text/event-stream");
    ctx.set("Cache-Control", "no-cache");
    ctx.set("Connection", "keep-alive");

    ctx.status = 200;
    ctx.respond = false; // 对于 Koa 框架
    ctx.res.flushHeaders();

    // 发送数据
    const sendEvent = (data: any) => {
      // console.log('[info: 49]:', '向客户端发送消息', data)
      ctx.res.write(`data: ${data}\n\n`);
    };

    // 模拟实时数据发送
    const interval = setInterval(() => {
      // console.log('[info: 55]:', '模拟实时数据发送')
      sendEvent(ctx.storage.getProperty(storage_prefix));
    }, 1000);

    // 当客户端关闭连接时清除定时器
    ctx.req.on("close", () => {
      clearInterval(interval);
      ctx.storage.removeProperty(storage_prefix);
    });
  });
};
