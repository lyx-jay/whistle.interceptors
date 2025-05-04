
const EXCLUDE_RULES = ['file']

function handleGlobalValue(globalValue: string) {
  // 按|分割多个规则
  const rules = globalValue.split('|').map(rule => {
    const ruleMap = new Map<string, string>()
    const pairs = rule.split('&')
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      ruleMap.set(key, value)
    })
    return ruleMap
  })
  
  return rules
}

export default (server: Whistle.PluginServer, options: Whistle.PluginOptions) => {
  server.on('request', async (req: Whistle.PluginServerRequest, res: Whistle.PluginServerResponse) => {
    if (req.method === 'POST') {
      req.on('data', (chunk) => {
        const reqBody = JSON.parse(chunk.toString())
        
        // 获取所有规则
        const rules = handleGlobalValue(req.originalReq.globalValue)
        
        // 遍历所有规则，找到匹配的规则
        for (const ruleMap of rules) {
          const isMatch = Array.from(ruleMap.entries()).every(([key, value]) => {
            if (EXCLUDE_RULES.includes(key)) {
              return true
            }
            return reqBody[key] && reqBody[key] === value
          })
          
          if (isMatch && ruleMap.has('file')) {
            options.getValue(ruleMap.get('file'), (value) => {
              res.end(value)
              return
            })
          }
        }
        
        // 如果没有匹配的规则，透传请求
        req.passThrough()
      });
    } else {
      req.passThrough()
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
