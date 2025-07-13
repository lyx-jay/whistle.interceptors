import { LOCAL_PREFIX, PROXY_MODE } from "./uiServer/constant"
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

function handleAndMode({conditions, payload, res, req, options, extra}: {
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  req: Whistle.PluginServerRequest,
  options: Whistle.PluginOptions,
  extra: {
    origin: string
  }
}) {
  let allMatch = true;
  let firstMatchingCondition: any = null;
  let firstMatchingIndex = -1;
  
  // 检查所有条件是否都匹配
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    if (!condition.enabled) continue;
    
    // 检查所有key-value对是否都匹配
    const isMatch = condition.pairs.every(pair => 
      pair.key && pair.value && payload[pair.key] === pair.value
    );
    
    if (!isMatch) {
      allMatch = false;
      break;
    }
    
    if (firstMatchingCondition === null) {
      firstMatchingCondition = condition;
      firstMatchingIndex = i;
    }
  }

  if (!allMatch) {
    return true
  }

  if (firstMatchingCondition?.proxyMode === PROXY_MODE.NETWORK) {
    req.getSession(session => {
      // 以condition为维度保存结果
      const conditionId = `${firstMatchingCondition.ruleId}_${firstMatchingIndex}`;
      // @ts-ignore
      options.localStorage.setProperty(`${LOCAL_PREFIX}_${conditionId}`, session.res.body)
    })   
    return true
  } else {
    res.setHeader('whistle-plugin', 'whistle.interceptors');
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', extra.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD')
    res.end(firstMatchingCondition?.response || conditions[0].response)
  }

}

function handleOrMode({conditions, payload, res, req, options, extra}: {
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  req: Whistle.PluginServerRequest,
  options:Whistle.PluginOptions,
  extra: {
    origin: string
  }
}) {
  let matchingCondition: any = null;
  let matchingIndex = -1;
  
  // 查找匹配的条件及其索引
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    if (!condition.enabled) continue;
    
    // 检查所有key-value对是否都匹配
    const isMatch = condition.pairs.every(pair => 
      pair.key && pair.value && payload[pair.key] === pair.value
    );
    
    if (isMatch) {
      matchingCondition = condition;
      matchingIndex = i;
      break;
    }
  }
  
  if (!matchingCondition) {
    return true
  }
  
  if (matchingCondition.proxyMode === PROXY_MODE.NETWORK) {
    req.getSession(session => {
      // 以condition为维度保存结果
      const conditionId = `${matchingCondition.ruleId}_${matchingIndex}`;
      // @ts-ignore
      options.localStorage.setProperty(`${LOCAL_PREFIX}_${conditionId}`, session.res.body)
    })   
    return true
  } else {
    res.setHeader('whistle-plugin', 'whistle.interceptors');
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', extra.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD')
    res.end(matchingCondition.response);
  }
}

function handleMatchMode({matchType, conditions, payload, res, req, options}: {
  matchType: 'and' | 'or',
  conditions: Rule['config']['conditions'],
  payload: Record<string, string>,
  res: Whistle.PluginServerResponse,
  req: Whistle.PluginServerRequest
  options: Whistle.PluginOptions
}) {
  const map = {
    'and': handleAndMode,
    'or': handleOrMode
  }
  
  const noMatch = map[matchType]({
    conditions,
    payload,
    res,
    req,
    options,
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

      if (!targetRule) {
        req.passThrough();
        return
      }


      const { conditions } = targetRule.config

      let payLoad: Record<string, string>
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        payLoad = await getBody(req)
      } else {
        // @ts-ignore
        payLoad = parseQuery(options.parseUrl(req.fullUrl).query)
      }

      const matchType = 'or'
  
      handleMatchMode({
        matchType,
        conditions,
        res,
        req,
        options,
        payload: payLoad
      })
    } catch (error) {
      req.passThrough();
    }
  });

};
