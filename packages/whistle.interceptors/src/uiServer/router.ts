import Router from 'koa-router';
import { apis } from './constant';

export default (router: Router) => {
  
  router.post(apis.add, (ctx) => {
    console.log('ssss', ctx.request.body)
    // ctx.stroage.
    ctx.body = 'ok'
  });

  router.delete(apis.delete, (ctx) => {
    console.log('ssss', ctx)
    ctx.body = 'ok'
  });
};
