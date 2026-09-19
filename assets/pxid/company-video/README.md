# 关于 PXID：设计、测试与装配现场

更新：2026-08-28。只针对 `cn/company.html` 的 `.r5Sw` 轮播。

| 说明 | 图片内容与本地素材 | 查看详情 |
| --- | --- | --- |
| 产品设计 | `../unified/process/odm-poster.webp`：设计师绘制电动滑板车手绘草图 | `cn/sustainability.html#stage-definition` |
| 样车与测试 | `../products/proof-testing.webp`：加载配重的滑板车测试台 | `cn/sustainability.html#stage-engineering`，样车制作、装配与功能检查 |
| 制造与装配 | `../products/proof-assembly.webp`：PXID 电动滑板车整车装配线 | `cn/sustainability.html#stage-delivery`，测试、整车装配与批量生产 |

三项按产品开发顺序展示实际工作场景：上方“ODM 服务范围”解释服务内容，这里提供对应的视觉证据，下方“项目起点”引导客户选择合作阶段。不再混合单一车型、骑行场景和企业宣传片。

按钮为原生详情链接，使用箭头图标，不使用播放图标或 `data-play`。保留原轮播结构、尺寸样式、视差属性及切换控件；共享 CSS 和 JavaScript 本轮未改动。

## 核对依据

素材沿用已批准的本地 PXID 官方资料：

- 设计手绘图是现有 ODM 宣传片的开头画面，只使用对应静帧，不把后续车型混剪作为设计过程视频。
- 测试图来源：`https://cdnus.globalso.com/pxid/Testing-quality-detection.jpg`。
- 装配图来源：`https://cdnus.globalso.com/pxid/1143.jpg`。
- 测试、装配图的原始素材记录见 `../products/catalog.json` 和 `../products/README.md`。
- 官方服务描述核对页：`https://www.pxid.com/services/?tab=1`、`https://www.pxid.com/prototype-production/?tab=4`、`https://www.pxid.com/testing-laboratory/?tab=8`。

不继续用原三段视频作为本模块的点击内容，原因：

- F2 视频展示车型和骑行场景，不能据此称为工程样车验证。
- about-pxid 视频展示设备、工厂、检验与整车装配，原先使用的 MANTIS 棚拍封面不对应内容。
- odm-process 视频从手绘设计开始，随后展示车型与骑行，不宜标为“制造、测试与批量生产”。

抽帧记录保存在工作区 `work/company-video-pairing/`，不属于网页依赖。原视频和 `f2-riding.jpg` 保留，未删除或重新编码，但不再被本模块引用。

图片、说明、详情目标以各自 HTML slide 为唯一来源。`pxid-site.js` 不再按轮播序号替换这三个标题；上一轮误改的 `.r4` Grid/Flex 样式已撤回。

验证：`work/check_company_video_pairing.mjs` 检查三项内容配对、本地详情锚点、原动效钩子与控件保留、其他模块未改变和旧文案不再覆盖。改前快照在 `work/company-evidence-20260828/`。

浏览器工具访问此本地站点受到安全策略限制，未完成实屏、滑动或点击跳转复测；静态检查不代表这些交互已验证。
