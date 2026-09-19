# 新闻详情页精修

更新：2026-08-28。

## 范围

只修改 `cn/news/` 内四篇真实文章及新增的 `templates/assets/pxid-news-detail.css`。
保留四页的导航、菜单、页脚和共享脚本；不改首页、新闻列表或其他内页。
重定向文件不参与模板修改。

## 阅读模板

- 首图桌面高度 440–600px，手机 400–500px，不再占满一屏多。
- 使用现有本地横竖双图方案；保留首图波浪。标题与分类成组轻量入场，正文不依赖滚动脚本才能显示。
- 全页仅一个文章标题；正文居中，最大行宽 800px，正文 18px / 1.9 行高，手机 17px。
- 导语、小标题、正文、配图、来源、相关文章依次排列。正文配图按原始比例完整显示。
- 文末保留波浪安全间距；来源与返回链接至少 44px 点击高度。
- 减少动态效果模式关闭新增入场动画。没有加入目录、悬浮按钮、复制链接或额外宣传区。

## 文本来源

1. 《模具、车架、涂装与整车装配》：
   - [模具加工与试模](https://www.pxid.com/mould-design/?tab=5)
   - [车架制造](https://www.pxid.com/mould-manufacturing/?tab=6)
   - [表面涂装](https://www.pxid.com/frame-manufacturing/?tab=7)
   - [装配与检验](https://www.pxid.com/mass-production/?tab=9)
   - 更正原文将放电加工、线切割和注塑归入车架制造的错误；它们属于模具加工/试模说明。移除“整车装配后检验，再进入批量生产”的不准确顺序表达。
2. 《从产品设计到批量生产》：沿用已批准文章内容，分为结构与电控、工程样车、制造与检验；来源指向 [产品设计](https://www.pxid.com/services/?tab=1)、[结构设计](https://www.pxid.com/mechanical-design/?tab=2)、[工程样车](https://www.pxid.com/prototype-production/?tab=4)、[装配](https://www.pxid.com/mass-production/?tab=9)。
3. 《P2 与 P6 获得 2024 GOOD DESIGN AWARD》：[PXID 获奖原文](https://www.pxid.com/news/good-news-pxid-wins-the-2024-g-mark-design-award/)。没有使用其他奖项的照片。
4. 《2026 PXID 品向智能制造简介》：原页面已批准的[公众号文字](https://mp.weixin.qq.com/s/L2EON37Os-NBv7End_kDVA)逐段保留。本轮未重新取得公众号原文，不新增或推导其中的数字。

## 新增图片

两张图片从上述 PXID 官方获奖文章下载，原图保存，不裁切产品或奖项标识：

- `p2-good-design-2024.png`，1267 × 713：[图片21.png](https://www.pxid.com/uploads/%E5%9B%BE%E7%89%8721.png)
- `p6-good-design-2024.png`，1080 × 608：[图片31.png](https://www.pxid.com/uploads/%E5%9B%BE%E7%89%8731.png)

其他配图复用本地 `inner-hero/`、`products/`、`unified/home-v2/` 与 `home/` 已批准素材；相应图源见各目录说明。

## 验证边界

`work/check_news_detail.py` 检查四篇文章结构、图片真实尺寸、相对路径、标题去重、来源链接、公众号原文保留，以及导航/页脚未改动。

浏览器工具对本地页面的访问受限，尚未完成实屏、真实手机、菜单点击、正常/快速/逆向滚动和动画播放验收。静态检查不能代替这些检查，也不声称已通过。
