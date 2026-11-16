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

## V2 品牌与多语言

当前页面使用 v3-style.css / v2-app.js。中英翻译在 v2-app.js 的 english 与页面 data-i 字段维护；语言偏好在浏览器本地保存。首屏 hero.jpg，标准字 wordmark.png，方形徽标 badge.png。来源：TGO 首页、/event、/event/1905 的黑金橙品牌与活动图文层级。

成长印记 posts.json 支持：title、title_en、date、location、location_en、category（分享/团聚）、summary、summary_en、url、cover、photos（图片路径数组）、video（视频文件路径）、visibility（public）。私密内容不可放入公开 JSON，visibility 不是安全边界。图片使用相对路径或 HTTPS 链接；视频推荐压缩 MP4，并控制体积。原始隐私照片须先经相关参与者确认公开范围。

共创 projects.json 支持：title、title_en、description、description_en、type、url、visibility（public）。当前未编造小组作品。

正式成立日期尚未确认；2025-10-21 只标记为章程记载的首次自组织会议。当前人数 11，来自用户提供的本届名单。

GitHub 登录链接交由 GitHub 认证并进入私有组员仓库；静态 Pages 不会读取 GitHub 会话，不会伪造登录状态或用户头像。若要本站内会话及头像，需增加 OAuth 后端，按成员权限校验访问。

小组章程原文件仅放在私有 members 仓库 CHARTER.docx。原章程有历史任职名单，本届分工以组员空间 README 与官网为准。

动效包括首屏入场、金属视觉光照缓动、桌面指针视差及滚动显现。低动态偏好与页面暂停按钮可关闭；触控端关闭鼠标视差。桌面、平板、手机分别调整导航、排版及首屏构图。
