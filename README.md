# whistle.interceptors

一个用于灵活拦截和模拟HTTP请求的whistle插件，提供可视化配置界面。

## 功能特点

- 支持请求体参数或查询参数的动态Mock能力
- 支持GET和POST请求的拦截
- 提供两种匹配模式：
  - 与（AND）模式：所有条件都满足时触发mock
  - 或（OR）模式：任一条件满足时触发mock
- 可视化配置界面，方便管理多个规则
- JSON格式响应编辑器
- 规则搜索和管理功能

## 安装

```bash
w2 install whistle.interceptors
```

## 使用方法

1. 在whistle中添加规则：
```
pattern interceptors://@ruleId=001
```

2. 访问配置页面：
- 打开whistle管理页面
- 点击Plugins标签
- 找到interceptors插件并点击进入配置界面

3. 创建规则：
- 点击"添加规则"按钮
- 设置规则名称和ID
- 选择请求方式（GET/POST）
- 选择匹配模式（与/或）
- 添加匹配条件和对应的响应内容

## 示例

比如要拦截以下请求：
```
GET /api/user?userId=001
```

可以创建规则：
1. 设置请求方式为 GET
2. 添加条件：key=userId, value=001
3. 设置对应的响应内容
4. 在whistle中配置：`example.com/api/user interceptors://@ruleId=your_rule_id`

当请求满足条件时，将返回配置的响应内容。

## 源码

本项目采用 monorepo 结构，包含以下部分：
- packages/frontend: 可视化配置界面
- packages/whistle.interceptors: whistle 插件核心逻辑