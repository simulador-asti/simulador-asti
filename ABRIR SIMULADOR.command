#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if ! command -v node &> /dev/null; then
  osascript -e 'display alert "Node.js não encontrado" message "Instale o Node.js em https://nodejs.org" as critical'
  exit 1
fi

echo "Iniciando Simulador de Pedidos ASTI (modo compartilhado)..."
node server.cjs &
SERVER_PID=$!
sleep 2
open http://localhost:4173
echo "Compartilhe o endereço de rede exibido acima com outras pessoas."
echo "Pressione Ctrl+C para encerrar."
wait $SERVER_PID
