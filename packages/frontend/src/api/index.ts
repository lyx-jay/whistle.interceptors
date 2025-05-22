import { request } from "./request";

export const addRuleCollections = async (data: any) => {
  return await request({
    url: '/collections/add',
    method: 'post',
    data,
  });
}

export const getRuleCollections = async () => {
  return await request({
    url: '/collections/query',
    method: 'get',
  });
}

export const notifyMessage = async (params: {
  storage_prefix: string
}): Promise<string> => {
  return new Promise(resolve => {

    const eventSource = new EventSource(`/whistle.interceptors/collections/sse?storage_prefix=${params.storage_prefix}`);

    eventSource.onmessage = (event) => {

      console.log('接收到的数据', event.data)
      if (event.data !== 'undefined') {
        eventSource.close();
        resolve(event.data);
      } else {
        eventSource.close();
        resolve('')
      }
    }

    eventSource.onerror = (error) => {
      console.error('sse链接失败', error);
      eventSource.close();
      resolve('');
    }
  })

}