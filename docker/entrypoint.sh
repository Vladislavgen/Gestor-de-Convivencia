#!/bin/sh
set -eu

cd /app

if [ ! -f package.json ] || [ ! -f package-lock.json ]; then
  echo "Faltan package.json o package-lock.json en /app." >&2
  exit 1
fi

lock_hash="$(sha256sum package-lock.json | awk '{print $1}')"
stamp="node_modules/.lock-hash"

install_deps() {
  if npm ci; then
    return 0
  fi
  echo "registry.npmjs.org no responde. Instalando desde registry.npmmirror.com."
  npm ci --registry https://registry.npmmirror.com
}

if [ ! -x node_modules/.bin/vite ] || [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$lock_hash" ]; then
  echo "Instalando dependencias dentro del contenedor..."
  install_deps
  mkdir -p node_modules
  echo "$lock_hash" > "$stamp"
fi

exec npm run dev -- --host 0.0.0.0 --port 5173
