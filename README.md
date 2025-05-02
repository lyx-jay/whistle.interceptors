# whistle.interceptors

一个用于灵活拦截和模拟HTTP请求的whistle插件。

## 功能特点

- 基于请求体参数的动态Mock能力
- 简单易用的配置规则

## 安装

```bash
npm install -g whistle.interceptors
```


## 配置示例

```
test.example.cn/api interceptors:// @userid=001&file=res.json
```

当匹配到test.example.cn/api请求时，如果请求体中参数userid=001，则返回res.json文件中的内容。

```
test.example.cn/api interceptors:// @userid=001&file=res.json|userid=002&file=res2.json
```

当匹配到test.example.cn/api请求时，如果请求体中参数userid=001，则返回res.json文件中的内容；如果请求体中参数userid=002，则返回res2.json文件中的内容。