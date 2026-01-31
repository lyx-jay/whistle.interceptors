import { LOCAL_PREFIX, PROXY_MODE } from "./uiServer/constant"
import { Rule } from "./types/rule"

// 内存缓存
let cachedRulesMap: Map<string, Rule> = new Map();
let lastRulesString: string | null = null;

/**
 * 更新规则缓存
 * 只有当 storage 中的数据发生变化时才重新解析
 */
function updateRulesCache(storage: Whistle.Storage) {
  const rulesString = storage.getProperty(LOCAL_PREFIX);
  if (rulesString === lastRulesString) {
    return;
  }
  
  try {
    const rules: Rule[] = JSON.parse(rulesString) || [];
    // 转换为 Map 实现 O(1) 查找
    cachedRulesMap = new Map(rules.map(rule => [rule.id, rule]));
    lastRulesString = rulesString;
  } catch (e) {
    // 解析失败时保持现状，如果是第一次则初始化为空
    if (lastRulesString === null) {
      cachedRulesMap = new Map();
      lastRulesString = rulesString;
    }
  }
}

/**
 * 高效解析查询参数
 */
export function parseQuery(queryString: string): Record<string, string> {
  if (!queryString) return {};
  const params: Record<string, string> = {};
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  if (!query) return {};

  const pairs = query.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const index = pair.indexOf('=');
    if (index > 0) {
      const key = pair.substring(0, index);
      const value = pair.substring(index + 1);
      if (value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
  }

  return params;
}

/**
 * 获取请求体
 */
export function getBody(req: Whistle.PluginServerRequest): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    req.getReqSession((session) => {
      try {
        // @ts-ignore
        resolve(JSON.parse(session.req.body || '{}'))
      } catch (e) {
        resolve({})
      }
    });
  });
}

/**
 * 处理 OR 匹配模式
 */
export function handleOrMode({conditions, payload, res, req, options, extra}: {
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
  
  // 查找第一个匹配的条件
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    if (!condition.enabled) continue;
    
    // 检查所有 key-value 对是否都匹配
    const isMatch = condition.pairs.every(pair => {
      if (!pair.key || !pair.value) return false;
      const actualValue = String(payload[pair.key] || '');
      if (pair.matchMode === 'exact') {
        return actualValue === pair.value;
      }
      console.log('模糊匹配', 'actualValue', actualValue, 'pair.value', pair.value);
      // 默认模糊匹配 (fuzzy)
      return actualValue.includes(pair.value);
    });
    
    if (isMatch) {
      matchingCondition = condition;
      matchingIndex = i;
      break;
    }
  }
  
  if (!matchingCondition) {
    return true // 返回 true 表示没有匹配，需要 passThrough
  }
  
  if (matchingCondition.proxyMode === PROXY_MODE.NETWORK) {
    req.getSession(session => {
      // 捕获模式：保存真实响应
      const conditionId = `${matchingCondition.ruleId}_${matchingIndex}`;
      // @ts-ignore
      options.localStorage.setProperty(`${LOCAL_PREFIX}_${conditionId}`, session.res.body)
    })   
    return true
  } else {
    // Mock 模式：返回配置的响应
    res.setHeader('whistle-plugin', 'whistle.interceptors');
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', extra.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD')
    res.end(matchingCondition.response);
    return false
  }
}

export default (server: Whistle.PluginServer, options: Whistle.PluginOptions) => {
  
  server.on('request', async (req: Whistle.PluginServerRequest, res: Whistle.PluginServerResponse) => {

    try {
      const id = req.originalReq.ruleValue
      if (!id) {
        req.passThrough();
        return;
      }

      // 更新并获取缓存
      updateRulesCache(options.storage);
      const targetRule = cachedRulesMap.get(id);

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
  
      const noMatch = handleOrMode({
        conditions,
        payload: payLoad,
        res,
        req,
        options,
        extra: {
          origin: req.headers.origin as string
        }
      })

      if (noMatch) {
        req.passThrough();
      }
    } catch (error) {
      req.passThrough();
    }
  });

};
