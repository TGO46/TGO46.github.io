# TGO46 官网

正式网站：https://tgo46.github.io/

原生 HTML / CSS / JavaScript，包含首页及「同行印记」。

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
