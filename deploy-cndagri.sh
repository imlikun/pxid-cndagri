#!/usr/bin/env bash
# cndagri(PXID 中文站) 双推脚本：改动 -> 提交 -> 推 GitHub
# 用法: ./deploy-cndagri.sh "提交说明"   (不传则用默认时间戳说明)
# 注意: ECS 本目录即线上站点工作树，提交即生效；GitHub 为版本备份。
set -e
cd "$(dirname "$0")"
git config --global --add safe.directory "$(pwd)" 2>/dev/null || true
MSG="${1:-chore: cndagri 站点更新 $(date +%Y-%m-%d_%H:%M)}"
git add -A
if git diff --cached --quiet; then
  echo "[deploy] 无改动，跳过提交。"
else
  git commit -q -m "$MSG"
  echo "[deploy] 已提交: $MSG"
fi
echo "[deploy] 推 GitHub (main) ..."
git push github main
echo "[deploy] 当前状态:"; git status -sb | head -1
echo "[deploy] 如需把 GitHub 最新拉回 ECS(部署): git pull github main"
