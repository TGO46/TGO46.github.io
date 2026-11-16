# TGO46 官网维护

正式网址：https://tgo46.github.io/

GitHub Pages 从 main 分支根目录发布，推送提交后会自动更新。官网使用原生 HTML/CSS/JavaScript，无需安装依赖。

## 公开文章

编辑根目录 posts.json，加入经过作者与相关参与者确认的公开记录：

```json
[{"title":"文章标题","date":"2026-11-16","category":"分享","summary":"公开摘要","url":"https://你的公开文章链接","visibility":"public"}]
```

category 使用 分享、团聚、AI。当前没有编造的活动报道。正文可用公开 Markdown 文档、公开 Discussion 或外部文章链接。

## 内部内容

内部内容放在组织私有仓库 https://github.com/TGO46/members 。不得进入本仓库、posts.json 或公开构建产物。前端筛选不是权限控制。

## 文件

- index.html：页面结构与宣传文案
- style.css：基础样式
- brand.css：对齐 TGO 官网的黑金与明亮内容区
- logo.svg：网站矢量徽章
- app.js：文章筛选和本地会议工具
- config.js：GitHub 组织及私有仓库入口

微信登录和在线大模型推理尚未接入；现有工具在浏览器本地执行。
