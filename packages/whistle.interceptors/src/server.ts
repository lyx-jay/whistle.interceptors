import { LOCAL_PREFIX } from "./uiServer/constant"
import { Rule } from "./types/rule"

function parseQuery(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  // 移除开头的 ? 号（如果存在）
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  
  // 分割参数对并解析
  query.split('&').forEach(item => {
    const [key, value] = item.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  
  return params;
}

function getBody(req: Whistle.PluginServerRequest): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    req.getReqSession((session) => {
      // @ts-ignore
      resolve(JSON.parse(session.req.body))
    });
  });
}

function handleAndMode({conditions, payload, res, extra}: {
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  extra: {
    origin: string
  }
}) {
  const isMatch = conditions.every((condition) => {
    const { key, value, enabled } = condition
    return enabled && payload[key] && payload[key] === value
  })

  if (!isMatch) {
    return true
  }

  res.setHeader('whistle-plugin', 'whistle.interceptors');
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Access-Control-Allow-Origin', extra.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD')
  res.end(conditions[0].response)

}

function handleOrMode({conditions, payload, res, extra}: {
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  extra: {
    origin: string
  }
}) {
  const matchingCondition = conditions.find(
    ({ key, value, enabled }) => enabled && payload[key] === value
  );

  if (!matchingCondition) {
    return true
  }
  
  res.setHeader('whistle-plugin', 'whistle.interceptors');
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Access-Control-Allow-Origin', extra.origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD')
  res.end(matchingCondition.response);

}

function handleMatchMode({matchType, conditions, payload, res, req}: {
  matchType: 'and' | 'or',
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  req: Whistle.PluginServerRequest
}) {
  const map = {
    'and': handleAndMode,
    'or': handleOrMode
  }
  
  const noMatch = map[matchType]({
    conditions,
    payload,
    res,
    extra: {
      origin: req.headers.origin
    }
  })

  if (noMatch) {
    req.passThrough();
  }
}


export default (server: Whistle.PluginServer, options: Whistle.PluginOptions) => {
  
  server.on('request', async (req: Whistle.PluginServerRequest, res: Whistle.PluginServerResponse) => {

    try {
      
      const id = req.originalReq.ruleValue
      const rules: Rule[] = JSON.parse(options.storage.getProperty(LOCAL_PREFIX)) || []
      const targetRule = rules.filter((rule: Rule) => rule.id === id)[0]
      const { matchType, method, conditions } = targetRule.config
  
      if (req.method !== method) {
        req.passThrough();
        return
      }
  
      let payLoad: Record<string, string>
      if (method === 'POST') {
        payLoad = await getBody(req)
      }
  
      if (method === 'GET') {
        // @ts-ignore
        payLoad = parseQuery(options.parseUrl(req.fullUrl).query)
      }
  
      handleMatchMode({
        matchType,
        conditions,
        res,
        req,
        payload: payLoad
      })
    } catch (error) {
      req.passThrough();
    }
  });

  // handle websocket request
  server.on('upgrade', (req: Whistle.PluginServerRequest, socket: Whistle.PluginServerSocket) => {
    // do something
    req.passThrough();
  });

  // handle tunnel request
  server.on('connect', (req: Whistle.PluginServerRequest, socket: Whistle.PluginServerSocket) => {
    // do something
    req.passThrough();
  });
};
