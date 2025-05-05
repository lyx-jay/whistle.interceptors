import Router from 'koa-router';
import { apis, LOCAL_PREFIX } from './constant';

type RouterContext =  {
  storage: Whistle.Storage
} & Router.IRouterContext


export default (router: Router) => {

  router.get(apis.get, (ctx: RouterContext) => {
    try {
      const data = ctx.storage.getProperty(LOCAL_PREFIX);
      console.log('get data', data)
      ctx.body = {
        result: 'ok',
        data: JSON.parse(data)
      }
    } catch (error) {
      ctx.body = {
        result: 'error',
        data: 'get rules error ' + error
      }
    }
  });
  
  router.post(apis.add, (ctx : RouterContext) => {
    console.log('ssss', ctx.request.body, typeof ctx.request.body)
    ctx.storage.setProperty(LOCAL_PREFIX, JSON.stringify(ctx.request.body))
    ctx.body = {
      result: 'ok',
      data: null
    }
  });

  router.delete(apis.delete, (ctx) => {
    console.log('ssss', ctx)
    ctx.body = 'ok'
  });
};
