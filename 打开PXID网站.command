#!/bin/zsh

set -u

site_dir="${0:A:h}"
port=4174

while lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1; do
  port=$((port + 1))
  if (( port > 4194 )); then
    echo "未找到可用的本地预览端口（已检查 4174–4194）。"
    echo "请关闭占用这些端口的程序后重试。"
    read -k 1 "?按任意键关闭…"
    exit 1
  fi
done

preview_url="http://127.0.0.1:${port}/cn/index.html"
log_file="${TMPDIR:-/tmp}/pxid-site-${port}.log"

cd "${site_dir}" || exit 1
python3 -m http.server "${port}" --bind 127.0.0.1 >"${log_file}" 2>&1 &
server_pid=$!

cleanup() {
  kill "${server_pid}" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

for attempt in {1..30}; do
  if curl -fsS "${preview_url}" >/dev/null 2>&1; then
    break
  fi
  sleep .1
done

if ! curl -fsS "${preview_url}" >/dev/null 2>&1; then
  echo "PXID 本地预览启动失败。日志位置：${log_file}"
  read -k 1 "?按任意键关闭…"
  exit 1
fi

if [[ "${PXID_NO_OPEN:-0}" != "1" ]]; then
  open "${preview_url}"
fi

echo "PXID 网站已打开："
echo "${preview_url}"
echo
echo "请保持本窗口开启；关闭窗口后本地预览服务会自动结束。"
wait "${server_pid}"
