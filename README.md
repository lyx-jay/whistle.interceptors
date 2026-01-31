[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/lyx-jay/whistle.interceptors)

# whistle.interceptors

一个用于灵活拦截和模拟HTTP请求的whistle插件，提供可视化配置界面。

## 功能特点

- **多维匹配**：支持请求体参数（JSON）或查询参数的匹配
- **灵活匹配模式**：
  - **Fuzzy (模糊匹配)**：支持子字符串包含匹配（默认模式）
  - **Exact (精确匹配)**：支持全字严格相等匹配
- **实时捕获**：支持 Live 模式自动捕获真实网络响应并转为 Mock
- **高效 UI 交互**：
  - 支持所有条件的快速搜索、高亮及上下导航
  - 提供现代暗黑模式界面，适配专业开发环境
  - 集成功能强大的 JSON 格式响应编辑器
- **高性能匹配**：服务端实现内存缓存与 Map 索引，查找复杂度低至 O(1)
- **快捷操作**：支持快捷键保存（Ctrl/Cmd + S）及多处自动保存逻辑

## 安装

```bash
w2 install whistle.interceptors
```

## 使用方法

1. **配置 Whistle 规则**：
   在 whistle 中添加如下规则，指定规则 ID：
   ```text
   pattern interceptors://@ruleId=your_rule_id
   ```

2. **访问可视化界面**：
   - 打开 whistle 管理页面
   - 点击 `Plugins` 标签
   - 找到 `interceptors` 并点击进入配置界面

3. **管理规则**：
   - **创建规则**：点击左侧“添加”，设置名称和 ID
   - **配置条件**：
     - 点击“添加条件”
     - 设置 Key 和 Value
     - 点击旁边的 `ab` 图标切换模糊/精确匹配模式
   - **设置响应**：点击 `Edit` 编辑 Mock 数据，或切换至 `Live` 模式捕获真实数据
   - **搜索定位**：规则项较多时，使用详情页顶部的搜索框快速定位

## 示例

假设要拦截 `/api/user?userId=123,456` 且当 `userId` 包含 `123` 时返回模拟数据：

1. **详情配置**：
   - 添加条件：`Key=userId`, `Value=123`
   - 模式：使用默认的 `Fuzzy Match` (ab 图标未激活)
   - 设置响应：`{"status": "mocked"}`
2. **Whistle 配置**：
   `example.com/api/user interceptors://@ruleId=your_rule_id`

当请求命中时，即使 `userId` 是 `123,456`，也会因为模糊匹配成功而返回 Mock 内容。

## 源码

本项目采用 monorepo 结构，包含以下部分：
- packages/frontend: 可视化配置界面
- packages/whistle.interceptors: whistle 插件核心逻辑
