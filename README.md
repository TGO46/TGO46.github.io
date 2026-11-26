<h1 align="center">TGO46 · 小组官网</h1>

<p align="center">TGO 鲲鹏会北京分会第 46 组的 AI-Native 官网</p>

<p align="center">
  <a href="https://github.com/TGO46/TGO46.github.io/actions/workflows/pages/pages-build-deployment"><img alt="Pages 部署状态" src="https://github.com/TGO46/TGO46.github.io/actions/workflows/pages/pages-build-deployment/badge.svg"></a>
  <a href="build.py"><img alt="Python 3 构建" src="https://raw.githubusercontent.com/TGO46/.github/main/profile/python.svg"></a>
  <a href="js"><img alt="原生 JavaScript" src="https://raw.githubusercontent.com/TGO46/.github/main/profile/javascript.svg"></a>
  <a href="src"><img alt="静态 HTML / CSS" src="https://raw.githubusercontent.com/TGO46/.github/main/profile/web.svg"></a>
</p>

<p align="center"><a href="https://tgo46.github.io/">访问官网</a> · <a href="https://tgo46.github.io/journey.html">同行印记</a> · <a href="https://tgo46.github.io/#create">共创作品</a> · <a href="https://github.com/TGO46/TGO46.github.io/issues">反馈问题</a></p>

## 本地预览与构建

```sh
python3 build.py
python3 -m http.server 8746
```

页面模板位于 `src/`；编辑后运行构建，CSS / JS 会附带内容版本号。不要直接修改生成的 `index.html` 和 `journey.html`。

- `js/data.js`：公开组员、活动与共创作品。
- `js/i18n.js`：中英文文案。
- `js/wordmark.js`：页脚逐字交互（包含 React Bits TechText 许可声明）。
- `assets/`：当前页面引用的图片、头像与短片。

## 发布

GitHub Pages 从 `main` 分支根目录发布；先构建并检查，再提交变更。`.nojekyll` 保持静态资源原样发布。

组员内部资料位于私有仓库，不进入公开站点；会议工具箱目前为已明确标注的样例 DEMO。
