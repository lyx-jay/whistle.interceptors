
const EXCLUDE_RULES = ['file']

function handleGlobalValue(globalValue: string) {

  const globalValueMap = new Map<string, string>()
  const arrs = globalValue.split('&')
  arrs.forEach((item) => {
    const [key, value] = item.split('=')
    globalValueMap.set(key, value)
  })

  return globalValueMap
}

export default (server: Whistle.PluginServer, options: Whistle.PluginOptions) => {
  
  server.on('request', async (req: Whistle.PluginServerRequest, res: Whistle.PluginServerResponse) => {
    
    if (req.method === 'POST') {
      req.on('data', (chunk) => {
        const reqBody = JSON.parse(chunk.toString())
        
        const map = handleGlobalValue(req.originalReq.globalValue)
        
        const isMatch = Array.from(map.entries()).every(([key, value]) => {
          if (EXCLUDE_RULES.includes(key)) {
            return true
          }
          return reqBody[key] && reqBody[key] === value
        })
        
        if (isMatch && map.has('file')) {
          options.getValues((values) => {
            res.end(values[map.get('file')])
          })
        }
      });
    }
    req.passThrough();
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
