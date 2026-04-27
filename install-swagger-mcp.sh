#!/bin/bash
set -e

echo "=== Instalando swagger-mcp ==="

# 1. Verifica se Python 3 esta instalado
if ! command -v python3 &> /dev/null; then
  echo "Python 3 nao encontrado. Instalando..."
  sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv
fi

echo "Python 3: $(python3 --version)"

# 2. Verifica se pipx esta instalado
if ! command -v pipx &> /dev/null; then
  echo "pipx nao encontrado. Instalando via apt-get..."
  sudo apt-get update && sudo apt-get install -y pipx
  pipx ensurepath
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "pipx: $(pipx --version)"

# 3. Instala swagger-mcp
if command -v swagger-mcp &> /dev/null; then
  echo "swagger-mcp ja esta instalado: $(which swagger-mcp)"
else
  echo "Instalando swagger-mcp..."
  pipx install swagger-mcp
fi

# 4. Valida instalacao
if command -v swagger-mcp &> /dev/null; then
  echo ""
  echo "=== Instalacao concluida ==="
  echo "swagger-mcp instalado em: $(which swagger-mcp)"
  echo ""
  echo "Se o comando 'swagger-mcp' nao for encontrado em um novo terminal,"
  echo "execute: export PATH=\"\$HOME/.local/bin:\$PATH\""
else
  echo ""
  echo "ERRO: swagger-mcp nao foi encontrado no PATH."
  echo "Tente abrir um novo terminal ou execute:"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  exit 1
fi
