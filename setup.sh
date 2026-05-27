#!/bin/bash
# setup.sh - Instalación del Agent SEO

set -e

echo "🚀 Agent SEO - Setup"
echo "==================="
echo ""

# Detectar directorio de skills
if [ -d "$HOME/.claude/skills" ]; then
  SKILLS_DIR="$HOME/.claude/skills"
elif [ -d "$HOME/.codex/skills" ]; then
  SKILLS_DIR="$HOME/.codex/skills"
elif [ -d "$HOME/.cursor/skills" ]; then
  SKILLS_DIR="$HOME/.cursor/skills"
else
  echo "❌ No Claude Code, Codex o Cursor skills directory found"
  echo "   Crea primero: mkdir -p ~/.claude/skills"
  exit 1
fi

echo "✅ Skills directory: $SKILLS_DIR"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
bun install
echo "✅ Dependencias instaladas"
echo ""

echo "🎉 Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Reinicia Claude Code"
echo "2. Abre tu proyecto React + Vite"
echo "3. Prueba: /seo-audit https://example.com"
echo ""
