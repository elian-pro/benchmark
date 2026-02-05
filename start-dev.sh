#!/bin/bash

# Script de inicio alternativo para desarrollo
# Usa un servidor HTTP simple en lugar de Vite

echo "========================================="
echo "  Zebra Benchmarking - Dev Server"
echo "========================================="
echo ""
echo "⚠️  Usando servidor HTTP simple (sin Vite)"
echo "📝 Asegúrate de configurar tu API_KEY en la consola del navegador:"
echo "   localStorage.setItem('GEMINI_API_KEY', 'tu_api_key_aqui')"
echo ""
echo "🌐 Servidor iniciando en http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener"
echo "========================================="
echo ""

python3 -m http.server 3000
