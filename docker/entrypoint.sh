#!/bin/sh
set -eu

cd /app

if [ ! -f package.json ] || [ ! -f package-lock.json ]; then
  echo "Faltan package.json o package-lock.json en /app." >&2
  exit 1
fi

lock_hash="$(sha256sum package-lock.json | awk '{print $1}')"
stamp="node_modules/.lock-hash"

registry_ok() {
  node -e '
    const https = require("https");
    const req = https.get("https://registry.npmjs.org/react", (res) => {
      res.resume();
      process.exit(res.statusCode && res.statusCode < 500 ? 0 : 1);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      process.exit(1);
    });
    req.on("error", () => process.exit(1));
  '
}

restore_lock() {
  if [ -f /tmp/package-lock.official.json ]; then
    cp /tmp/package-lock.official.json package-lock.json
  fi
}

trap restore_lock EXIT

if [ ! -d node_modules/react ] || [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$lock_hash" ]; then
  echo "Instalando dependencias dentro del contenedor..."
  if registry_ok; then
    npm ci
  else
    echo "registry.npmjs.org no responde. Instalando los mismos paquetes desde registry.npmmirror.com."
    cp package-lock.json /tmp/package-lock.official.json
    sed 's#https://registry.npmjs.org/#https://registry.npmmirror.com/#g' /tmp/package-lock.official.json > package-lock.json
    npm ci
    restore_lock
  fi
  mkdir -p node_modules
  echo "$lock_hash" > "$stamp"
fi

exec npm run dev -- --host 0.0.0.0 --port 5173
