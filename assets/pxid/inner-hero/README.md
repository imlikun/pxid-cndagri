# 内页 Hero 图源与构图

更新：2026-08-28。只替换中文内页 Hero；首页、标题文案、波浪和入场脚本不改。

| 页面 | 横屏图 | 手机竖屏图 | 用图逻辑 |
| --- | --- | --- | --- |
| 关于 PXID | company-desktop.jpg | production-mobile.webp | 团队与基地 / 真实生产现场 |
| 产品方案 | ../home/mantis-mountain.png | ../home/mobile/hero-mantis-p6-portrait.jpg | 已批准的 MANTIS P6 横竖构图，保持完整产品辨识 |
| ODM 全流程 | tooling-desktop.webp | tooling-mobile.webp | 模具与工程制造 |
| 新闻与资料 | design-desktop.webp | design-mobile.webp | 产品设计、草图与设计工作 |
| 项目咨询 | contact-desktop.jpg | design-mobile.webp | 到访基地 / 从产品设计开始沟通 |
| 隐私政策、法律声明 | company-desktop.jpg | production-mobile.webp | 沿用公司身份图，不引入其他产品或品牌 |

## 官方图源

- company-desktop.jpg：[关于 PXID](https://www.pxid.com/about-us/) 中的 `https://cdnus.globalso.com/pxid/Engineered-for-Scale.-Built-for-Mobility.1.jpg`
- contact-desktop.jpg：[联系 PXID](https://www.pxid.com/contact-us/) 中的 `https://cdnus.globalso.com/pxid/factory001.jpg`
- design-desktop.webp / design-mobile.webp：[PXID 官网首页](https://www.pxid.com/) 的 `设计.jpg` / `设计.1.jpg`
- tooling-desktop.webp / tooling-mobile.webp：同页的 `模具.jpg` / `模具.1.jpg`
- production-mobile.webp：同页的 `生产.3.jpg`
- 以上 WebP 图来自 `https://cdnus.globalso.com/pxid/{文件名}!/format/webp/lossless/true`，下载后本地加载，不依赖外网。
- 产品方案复用当前项目已批准的本地首页素材，没有新增或合成产品图。

## 适配与不可破坏项

- 使用原生 `<picture>`，宽度不超过 900px 且为竖屏时选择独立手机图；横屏使用横版图。无需 JS 才能选择图片。
- 官方手机素材为 750 × 1000（3:4），产品图为 941 × 1672（接近 9:16），没有把横图拉伸成竖图。
- 保留 `.photo.alanGo`、`.pic.full`、标题节点和两个 `.wave`，图片在原来的动画容器内部。
- 设计图桌面端取左上方的绘图区域；手机端取下方的绘图区域，避开原素材奖项装饰带。
- 模具竖图在图片容器内部放大 1.25 倍，去掉素材顶部和底部的黑边；不移动标题、波浪或整个 Hero。
- 图片不延迟加载，使用 `fetchpriority="high"`。所有引用均为相对本地路径，保留 file:// 打开方式。

## 验证边界

已检查素材可解码、实际尺寸与 HTML 一致、路径存在、七页均配置横竖双图，以及首页和动效脚本未改动。当前浏览器工具对该本地页面访问受限，未完成实屏、真机或动画回归；源图检查与规则检查不能替代这些验证。
