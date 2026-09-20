# AGENTS.md — PXID 中文站（cndagri）

> 给 AI 编码代理的项目上下文。**第 1 节是环境与部署，先照它执行；第 5 节是禁止操作，违反会直接毁线上。**

---

## 1. 环境与部署（照抄命令，不要自己发挥）

### 1.1 服务器

| 项 | 值 |
|---|---|
| 主机 | `101.133.136.140`（阿里云 ECS，CentOS/Alinux 5.10） |
| 用户 | `root` |
| 登录方式 | **SSH 密钥**（无密码）。Windows 本机密钥：`C:\Users\Kun.li\.ssh\id_ed25519_appin_server` |
| 登录命令 | `ssh -i C:/Users/Kun.li/.ssh/id_ed25519_appin_server root@101.133.136.140` |
| Web 面板 | 宝塔面板（同机） |
| 站点根 | `/www/wwwroot/appin.site` |

### 1.2 站点路径（关键：仓库根 = 线上工作树）

| 用途 | 路径 |
|---|---|
| **仓库根 = 线上站点目录**（改这里的文件 = 改线上，立即生效） | `/www/wwwroot/appin.site/nav/three-sites/cndagri` |
| **中文站页面** | `/www/wwwroot/appin.site/nav/three-sites/cndagri/cn/` |
| 站点图片/媒体 | `/www/wwwroot/appin.site/nav/three-sites/cndagri/assets/pxid/` |
| **共享 CSS/JS**（不在 cndagri 内！） | `/www/wwwroot/appin.site/nav/three-sites/templates/assets/` |
| 同机其他站点（勿动） | `/www/wwwroot/appin.site/nav/three-sites/pxid-cn-official-v2`、`pxid-zh-site` |

> cndagri 页面里的 `<link href="../templates/assets/index.css">` 指向 **templates 目录**，改样式先确认改的是哪一层。

### 1.3 线上地址

首页：`https://appin.site/nav/three-sites/cndagri/cn/index.html`

### 1.4 GitHub

| 项 | 值 |
|---|---|
| 仓库 | `git@github.com:imlikun/pxid-cndagri.git` |
| 分支 | `main`（当前线上态）；`master` 是 09-15 旧快照，**不要动、不要强推** |
| remote 名 | `github` |
| ECS 侧密钥 | `~/.ssh/id_ed25519_github`（`~/.ssh/config` 已配 `Host github.com`） |
| 本机侧密钥 | `C:\Users\Kun.li\.ssh\id_ed25519_github` |

### 1.5 部署 = 提交 + 推 GitHub（两步合一）

ECS 上已放好脚本，**在仓库根执行**：

```bash
cd /www/wwwroot/appin.site/nav/three-sites/cndagri

# 改完文件后：
./deploy-cndagri.sh "一句话说明这次改了什么"     # = git add -A && commit && git push github main
```

因为**仓库根目录本身就是线上站点目录**，所以：
- 文件一存盘，线上立即生效，**不需要额外的"发布"步骤**
- `deploy-cndagri.sh` 只负责把这次改动记进 git + 推到 GitHub

### 1.6 回滚

```bash
cd /www/wwwroot/appin.site/nav/three-sites/cndagri
./rollback-cndagri.sh                # 列出所有可回退版本（含时间与说明）
./rollback-cndagri.sh <commit>       # 回到指定版本（会自动备份当前 + 提交 + 推 GitHub）
```

当前定稿标记：tag `v2026-09-19-2250-dinggao`

### 1.7 凭据（怎么取）

服务器与 GitHub 都是**密钥登录，没有密码**，直接用下面路径的 key：

| 用途 | 凭据 | 位置 |
|---|---|---|
| 登录 ECS | SSH 私钥 | `C:\Users\Kun.li\.ssh\id_ed25519_appin_server` |
| 推 GitHub（本机） | SSH 私钥 | `C:\Users\Kun.li\.ssh\id_ed25519_github` |
| 推 GitHub（ECS 内） | SSH 私钥 | `~/.ssh/id_ed25519_github`（`~/.ssh/config` 已配好） |
| GitHub API / https 方式 | 细粒度 PAT | 见下（口令库） |

口令库（AES-256-GCM 加密；脚本 `C:\Users\Kun.li\.workbuddy\skills\account-vault\vault.js`，数据 `~/.workbuddy/accounts/vault.json`）：

```bash
# 列出所有条目
node "C:/Users/Kun.li/.workbuddy/skills/account-vault/vault.js" list

# 脱敏查看（默认）
node "C:/Users/Kun.li/.workbuddy/skills/account-vault/vault.js" get GitHub

# 取明文（仅在明确需要复制粘贴时用）
node "C:/Users/Kun.li/.workbuddy/skills/account-vault/vault.js" raw GitHub-PAT-WorkBuddy
```

已收录且与本项目相关的条目：

| 条目名 | 内容 |
|---|---|
| `GitHub-PAT-WorkBuddy` | GitHub 细粒度 PAT（Contents 读写 / 所有仓库），https 方式推仓库或调 API 用 |
| `GitLab PXID` | `git.pxidiot.com:8099` 的 likun 账号 PAT |
| `DNSPod-API` | pxid-api.appin.site 的 SSL DNS-01 验证 |
| `PXID运营后台AdminToken` | pxid-api.appin.site 运营后台 Bearer |

> 注意：口令库里**没有** ECS root 密码（本机一直用密钥登录）；如需宝塔面板密码，那是另一台机器（47.100.105.156）的条目。

---

## 2. 项目结构与页面清单

### 2.1 无构建、无依赖

纯静态 HTML + CSS + 原生 JS，**没有 package.json / vite / npm**。不要尝试安装依赖或跑构建。

### 2.2 生产页面（`cndagri/cn/`）

| 文件 | 页面 |
|---|---|
| `index.html` | 首页（改动最频繁，约 400KB） |
| `manufacturing.html` | 制造能力 |
| `business.html` | 产品方案 |
| `company.html` | 关于 PXID |
| `contact.html` | 联系我们 |
| `news.html` | 新闻中心 |
| `sustainability.html` | ODM 全流程（首页 S7 的 CTA 指向此页） |
| `search.html` | 搜索 |
| `legal-notice.html` / `privacy-policy.html` | 法律声明 / 隐私政策 |

### 2.3 非生产文件（不要动、不要删）

- `cndagri/cn/_*-test.html`（`_f2/f3/f4/n1/nav/p1/p2/s1/s2/s6/s7-test.html`）—— 历史测试页
- `cndagri/_bak-*/`、`cndagri/cn/_bak-*/`、`*.bak-*` —— 回退快照（已在 `.gitignore` 中排除）
- `cndagri/` 根下的 `index.html / business.html / company.html / ...` —— **英文站**，与 `cn/` 中文站不是一回事，改中文站不要碰它们

### 2.4 图片素材（`cndagri/assets/pxid/`）

| 目录 | 内容 |
|---|---|
| `home/` | 首页专用（hero、banner、`odm-process.mp4` 等） |
| `factory/` | 工厂实拍（80 张，语义化命名） |
| `unified/process/` | 工艺图（46 张，`process-01.webp` … `process-09.webp`） |
| `unified/news/` | 新闻/能力图 |
| `products/` | 产品图 |
| `map/` | 地图相关 |
| `globe-assets/` | N3 三维地球用的 echarts 脚本 |

### 2.5 共享 JS（`templates/assets/`）

| 文件 | 职责 |
|---|---|
| `pxid-site.js` | 运行时替换 header / footer、菜单 |
| `pxid-motion-v1.js`（旧名 `pxid-motion.js`） | 入场动画（`.alanGo` / `.alanFn` 类） |
| `pxid-home-motion.js` / `pxid-home-performance.js` | 首页动效 |
| `pxid-cooperation-video.js` | 合作段视频 |
| `pxid-product-rail.js` | 产品横向滑轨 |
| `swiper-bundle.js` | 轮播 |
| `index.css` / `pxid-overrides.css` / `respone.css` | 全站样式 |

**改 CSS/JS 引用时注意版本号**：形如 `?v=20260914-native1`，改完要升版本号，否则浏览器缓存不刷新。

---

## 3. 首页（index.html）内部结构

### 3.1 DOM 骨架

```html
<body id="app" class="home afterInner">   <!-- id="app" 必须有，缺了全站 CSS 失效 -->
  <header>…</header>                       <!-- 运行时由 pxid-site.js 替换 -->
  <section id="pxidS1" class="row banner">…</section>      <!-- hero -->
  <section id="pxidS2" class="row r1 pxid-odm-intro">…</section>  <!-- 产品 ODM 概览 -->
  <section id="pxidS4">…</section>
  <section id="pxidS6" class="row r5 pxid-network" data-s1v="orig">…</section>  <!-- 淮安地图 -->
  <section id="pxidS7" class="row pxid-process-section" data-s1v="orig">…</section> <!-- ODM 服务流程 -->
  <footer id="footer-contact">…</footer>
</body>
```

### 3.2 可变版式框架（S2 / S6 / S7 共用同一套机制）

```html
<section id="pxidSn" data-s1v="orig">
  <div class="inner">…默认版式（orig）…</div>
  <iframe class="pxid-snframe" hidden></iframe>        <!-- 变体渲染容器 -->
  <div class="pxid-snswitch">                          <!-- 切换按钮 -->
    <button data-v="orig">…</button>
    <button data-v="a">…</button>
  </div>
  <template class="pxid-sntpl" data-v="a">…完整 HTML…</template>   <!-- 变体内容 -->
</section>
<style id="pxid-sn-switch-css">…</style>
<script id="pxid-sn-switch-js">…</script>
```

机制：JS 从 `template[data-v=X]` 取 innerHTML → 塞进 iframe 的 `srcdoc` → 显示 iframe、隐藏 `.inner`；同时 `data-s1v` 切到 X，用 CSS 控制显隐。

- 默认值由 JS 末尾那个 `set(...)` 决定，选择记在 `localStorage`（键 `pxid-s2-v` / `pxid-s4-v` / `pxid-s7-v2`）
  **S6 是例外**：09-20 起只剩一档，脚本硬锁 `set("a")`，已不读写 `localStorage`
- **想改默认版式**：改 JS 里 `saved` 的兜底值；若旧的 `localStorage` 值会干扰，把 `KEY` 升级（如 `pxid-s7-v` → `pxid-s7-v2`）。S6 已无 `saved`，直接改末尾的 `set("a")`

### 3.3 S6 淮安地图：只有 M1 一档（2026-09-20 起）

`cn/index.html` 里 `#pxidS6` 现在**只保留 `data-v="a"` = M1 明暗维度**一套模板：

- 已删除：`orig` 线上原样（段内那张内联 SVG 中国地图）、`b` N1 标准政区图、`c` N2 线框政区图、`d` N3 三维地球
- 已删除：`.pxid-s6switch` 按钮条 + 它那 7 条 CSS + 脚本里的 `btns` / `KEY` / `localStorage` / `EXT`(echarts)
- `#pxid-s6-switch-js` 脚本块**还在，别当废弃代码删**：M1 仍走 iframe `srcdoc` 渲染，脚本负责拼 iframe 文档和 `centerContent()` 垂直居中
- 保留 `#pxidS6 > .inner` 里的 `h2#network-heading` + `.network-lede`（`visibility:hidden` 但占位，且供 SEO / 无障碍）

**两个再改这块必须知道的坑：**
1. **段高不能靠内容撑了。** iframe 是 `position:absolute;inset:0`，完全不贡献高度；原先段高由「线上原样」那张地图撑出来。现在写死在 `#pxid-s6-switch-css` 里：`#pxidS6{position:relative;height:100vh;height:100svh}`。删了原样图又不给这条高度 → M1 一起塌没。
2. **`doc()` 取不到模板时不要再回落 `orig`。** 现在写成 `else { return; }`。改回 `v="orig"` 会渲染一张已经不存在的地图。
3. 顺带：`globe-assets/`（echarts 系）现在首页**不再加载**，但目录留着 —— `_s6-test.html` / `_s7-test.html` 两个测试页里还有完整的 5 档版本可参考。

---

## 4. 设计约束（改样式前必读）

- 颜色：强调色只有红 `#d71920`；墨 `#171717`；灰白 `#f6f6f4`。红色只用于序号 / 短横线 / 按钮
- 硬边：**零圆角、无边框、无阴影**；层次靠字号 + 灰度 + 底色
- **文字压在图片上时用底色/遮罩提对比，禁止 `-webkit-text-stroke` 和 `text-shadow`**
- 段落留白用 `.blk{padding:clamp(...) 0}`；深色段只改 `padding-block`，别用 `padding` 简写（会冲掉左右内边距）
- 新增 class 一律加前缀（如 `.pxb-`），**不要占用站点已用的通用类名**（`.row` / `.tile` / `.cap` / `.blk` / `.wrap` / `.inner` / `.bg`）
- 图片加 `loading="lazy"`；卡片图区必须固定 `height` + `object-fit:cover`，不要用 `flex:1` + `min-height`

---

## 5. 禁止操作（违反会毁线上）

1. **禁止用本地文件覆盖线上。**
   本地 `D:\WorkBuddy\2026-09-12-13-36-21\cndagri\` 里的副本**经常是旧的**，`scp` 上去会把整站回退、丢掉别人后来的改动。
   → 要改就**在 ECS 上直接改**：`ssh` 进去，用脚本对 `/www/wwwroot/appin.site/nav/three-sites/cndagri/...` 做**精确替换**；或本地改完 **先 diff 线上现状**再决定要不要推。

2. **禁止整段替换带动画/脚本的 DOM 区块。**
   把旧版本的整段 `<section>` 连同旧 `<style>` + `<script>` 一起换进来，会让开屏卡在 `LOADING 00%`（旧 JS 与现有逻辑冲突）。
   → 正确做法：**只搬数据块（`<template>` / HTML），复用页面现有的 JS**；换完先截图确认。

3. **禁止只看 HTTP 状态码判断线上是否正常。**
   本站在文件不存在时**也返回 `200` + `text/html`**（假 200）。
   → 判断资源是否存在必须看 `content-type`（图片要 `image/*`）；验证页面必须**真截图**。

4. **禁止用 `rm`/通配符批量删文件。** 删除只做点名的精确文件名。

5. **禁止强推 GitHub 的 `master` 分支**，那是 09-15 的历史快照。

---

## 6. 改动后的验证清单

```bash
# ① 服务端确认线上真的吐出了新内容（别只信本地）
curl -sk -H "Host: appin.site" \
  https://127.0.0.1/nav/three-sites/cndagri/cn/index.html \
  -o /tmp/live.html -w "http=%{http_code} ct=%{content_type} size=%{size_download}\n"
grep -c "你这次加的标记字符串" /tmp/live.html

# ② 关键资源类型是否正确
curl -skI -H "Host: appin.site" https://127.0.0.1/<资源路径> | grep -i content-type

# ③ 提交并推送
cd /www/wwwroot/appin.site/nav/three-sites/cndagri && ./deploy-cndagri.sh "说明"
```

截图验证（本机 Node + playwright-core 复用已装 chromium）：

```js
// 元素截图遇到动画会超时，用整页 clip 更稳
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);                 // 等入场动画
await page.evaluate(() => { const e = document.getElementById('pxidS6');
  window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY); });
await page.waitForTimeout(3500);
await page.screenshot({ path: 'out.png', clip: {x:0,y:0,width:1440,height:900}, animations: 'disabled' });
```

---

## 7. 常用替换脚本模板（在 ECS 上跑）

```python
# /tmp/patch.py —— 本地写好 → scp 到 ECS /tmp → ssh 执行 python3 /tmp/patch.py
import re
P = "/www/wwwroot/appin.site/nav/three-sites/cndagri/cn/index.html"
h = open(P, encoding="utf-8").read()
old = "……精确的一小段原文……"
new = "……替换后的内容……"
assert h.count(old) == 1, "锚点不唯一：%d" % h.count(old)     # 必须断言唯一
h = h.replace(old, new, 1)
open(P, "w", encoding="utf-8").write(h)
print("ok", len(h.encode("utf-8")))

# 改完立刻：① 备份副本 ② 服务端 curl 自检 ③ ./deploy-cndagri.sh
```

抽某个 section 的完整片段（含嵌套 `<section>` 与外层 `<defs>`）时必须**按嵌套深度配对**，不能取第一个 `</section>`：

```python
SEC_OPEN, SEC_CLOSE = re.compile(r"<section\b[^>]*>"), re.compile(r"</section>")
def outer_section(h, key):
    i = h.find(key); start = [m for m in SEC_OPEN.finditer(h) if m.start() < i][-1].start()
    depth, j = 0, start
    while True:
        mo, mc = SEC_OPEN.search(h, j), SEC_CLOSE.search(h, j)
        if not mc: return None
        if mo and mo.start() < mc.start(): depth += 1; j = mo.end()
        else:
            depth -= 1; j = mc.end()
            if depth == 0: return h[start:j]
```

---

## 8. 当前进度（截至 2026-09-20 14:30）

- S2 / S7 各带一套「版式切换」按钮（S2：当前版式 ↔ ODM 服务流程；S7：ODM 服务流程 ↔ 产品概览）；S4 也有（当前 `data-s1v="b"`）
- **S6 地图已收敛为 M1 单档**，切换按钮一并删除（见 §3.3）。`index.html` 从 398,284 降到 180,175 字节
- `sustainability.html` 的 `#odm-intro` 已从 5 步扩到 **10 步**，并把第四轮 3 档 Bento（A 竖井 / B 双轨 / C 对角双核）做成真页面可切换对比（`d304d88`）：切换条只剩这 3 个按钮，旧 `orig/a/b/c/e` 的 DOM 与文案**原样保留、仅隐藏**，默认 `ba`，`localStorage` 旧值夹在三档内。**坤哥选定后收尾**：删掉落选两档 + 整个 `.f2-switch` + 旧 5 档 DOM 与那段 F2 `<style>`/`<script>`
- 首页 hero = **3 张原图轮播 + 1 档 ODM 视频**（2026-09-20 坤哥要两相对比）：视频不再 `z-index:14` 盖住 `.photo`，`.pager` 末尾多一个独立点位 `.pxid-hero-video-dot`（**不能复用 `BannerDot` 类**，见下条），点它给 `#pxidS1` 加 `.pxid-hero-video-on` → 图片/文案层淡出、视频 play；点回图档 pause 交还轮播。逻辑在 `templates/assets/pxid-hero-video-cmp.js`。页面另有 4 处波浪、footer 波浪，未动
- Git 最新提交：`d304d88`（`#odm-intro` 10 步 + 3 档 Bento 上线对比）

### 已知遗留

- `cn/_*-test.html` 共 11 个测试页未清理（不影响线上）
- 部分按钮文案与模板内容可能不符（例如曾出现按钮写「标准政区图」而实际渲染 M1）——改动前先核对 `template` 内部的 `<section id>` 与按钮 `data-v`。**S6 已无此问题**（按钮已删）
- `cn/odm-options4.html` 是 ODM 10 步 Bento 的**第四轮评审页**（临时公开可访问），坤哥选定方案后删除，别当站内页维护
- hero 轮播控制器 `templates/assets/pxid-home-motion.js`（由 `body[data-motion-src]` 延迟注入）把 `.bannerPic` / `.bannerList` / `.BannerDot` 当**平行数组按下标取**：三者数量必须一致，多一个 `BannerDot` 会 `copies[3]` 越界抛错并让切换整体失效
- 往 `cn/index.html` **body 末尾塞内联 `<script>` 会静默不执行**（实测不进 `document.scripts`），新逻辑一律走 `templates/assets/*.js` 外链
- `#pxidS6` 那套模板内部还留着 N3 三维地球的**死代码**（`window.echarts` / `globe-assets/` 那段），因为没有 `#pxidGlobe` 元素所以恒不执行；清它属于额外风险，暂未动
