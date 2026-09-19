#!/usr/bin/env bash
# cndagri 首页版本回退工具
# 用法:
#   ./rollback-cndagri.sh                  # 列出所有可回退版本
#   ./rollback-cndagri.sh <commit>         # 回退到指定版本（自动备份当前 + 提交 + 推 GitHub）
set -e
cd "$(dirname "$0")"
git config --global --add safe.directory "$(pwd)" 2>/dev/null || true

if [ -z "$1" ]; then
  echo "===== cndagri 可回退版本（新 -> 旧） ====="
  git log --pretty=format:"%h  %ad  %s" --date=format:"%m-%d %H:%M" -25
  echo
  echo
  echo "===== tags ====="
  git tag -l | tail -10
  echo
  echo "回退用法:  ./rollback-cndagri.sh <commit 前 7 位>"
  exit 0
fi

TARGET="$1"
if ! git rev-parse --verify "$TARGET^{commit}" >/dev/null 2>&1; then
  echo "找不到版本: $TARGET"; exit 1
fi

TS=$(date +%Y%m%d-%H%M%S)
echo "[1/4] 备份当前线上文件 -> cn/_bak-rollback-$TS/"
mkdir -p "cn/_bak-rollback-$TS"
cp -a cn/index.html "cn/_bak-rollback-$TS/index.html"

echo "[2/4] 取出目标版本 $TARGET 的文件"
git checkout "$TARGET" -- .

echo "[3/4] 提交回退"
git add -A
git commit -q -m "revert: 站内文件回退到 $TARGET（回退前已备份 cn/_bak-rollback-$TS）"

echo "[4/4] 推送 GitHub"
git push github main

echo
echo "完成。当前 HEAD: $(git log --oneline -1)"
echo "线上已生效（ECS 工作树 = 线上站点）。"
