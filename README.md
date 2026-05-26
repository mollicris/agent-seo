# Agent SEO para React + Vite

> **AI-powered SEO optimization agent** para aplicaciones React con Vite. Especializado en Meta Tags y Open Graph.

## 📋 Descripción

Agent SEO es un agente autónomo basado en la arquitectura de [gstack](https://github.com/garrytan/gstack) que audita, optimiza y revisa la implementación SEO de aplicaciones React + Vite, enfocándose inicialmente en:

- **Meta Tags** (`title`, `description`, `keywords`, `robots`, `canonical`)
- **Open Graph** (redes sociales: Facebook, LinkedIn, etc.)
- **Twitter Card** (optimización para X/Twitter)

Desarrollado con TypeScript, Bun y Claude Code.

## 🎯 Características iniciales

- ✅ `/seo-audit` — Analiza tu aplicación y detecta problemas SEO
- ✅ `/seo-optimize` — Genera automáticamente meta tags y Open Graph optimizados
- ✅ `/seo-review` — Valida cambios antes de hacer merge
- 🔜 `/lighthouse-report` — Core Web Vitals (próxima fase)
- 🔜 `/sitemap-generate` — Sitemap automático (próxima fase)
- 🔜 `/schema-builder` — JSON-LD estructurado (próxima fase)

## 🚀 Inicio rápido

### Requisitos

- Node.js 18+
- Bun 1.0+
- Claude Code
- Git

### Instalación (30 segundos)

```bash
# 1. Clonar el repo
git clone https://github.com/mollicris/agent-seo.git ~/.claude/skills/agent-seo

# 2. Setup
cd ~/.claude/skills/agent-seo && ./setup

# 3. En Claude Code, usa los skills:
/seo-audit https://myapp.com
/seo-optimize src/pages
/seo-review
```

### Uso en tu aplicación React + Vite

```bash
cd tu-app-react-vite

# Audita problemas SEO
/seo-audit .

# Genera meta tags + Open Graph
/seo-optimize src/pages

# Revisa antes de merge
/seo-review
```

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Diseño y decisiones técnicas
- [SKILLS.md](./docs/skills.md) — Documentación completa de cada skill
- [Meta Tags Guide](./docs/meta-tags-guide.md) — Guía de meta tags para React + Vite
- [Open Graph Guide](./docs/og-guide.md) — Implementación de Open Graph

## 🏗️ Estructura del proyecto

```
agent-seo/
├── skills/
│   ├── seo-audit/
│   │   ├── SKILL.md
│   │   └── src/
│   │       ├── audit.ts
│   │       ├── validators/
│   │       │   ├── meta-tags.ts
│   │       │   ├── open-graph.ts
│   │       │   └── twitter-card.ts
│   │       └── report.ts
│   │
│   ├── seo-optimize/
│   │   ├── SKILL.md
│   │   └── src/
│   │       ├── optimize.ts
│   │       └── generators/
│   │           ├── meta-tag-generator.ts
│   │           └── og-generator.ts
│   │
│   └── seo-review/
│       ├── SKILL.md
│       └── src/review.ts
│
├── src/
│   ├── types.ts
│   ├── validators/
│   ├── generators/
│   ├── utils/
│   └── cli.ts
│
├── tests/
├── docs/
├── setup.sh
├── package.json
└── README.md
```

## 🔧 Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun 1.0+
- **HTML Parser**: Cheerio
- **HTTP Client**: Axios
- **Validation**: Zod
- **AI**: Claude Code + Agent SDK

## 📖 Roadmap

### Fase 1: Meta Tags + Open Graph ✅
- [x] `/seo-audit` básico
- [x] Meta tags validator
- [x] Open Graph validator
- [x] `/seo-optimize` generador
- [ ] `/seo-review` integrado

### Fase 2: Core Web Vitals 🔜
- [ ] `/lighthouse-report`
- [ ] LCP/CLS/FID analysis
- [ ] Performance recommendations

### Fase 3: Sitemap & Robots 🔜
- [ ] `/sitemap-generate` dinámico
- [ ] `robots.txt` automático
- [ ] Crawlability audit

### Fase 4: Structured Data 🔜
- [ ] `/schema-builder` JSON-LD
- [ ] Breadcrumbs schema
- [ ] Product/Article schema

## 💡 Ejemplos de uso

### Auditar una aplicación

```bash
You: /seo-audit https://myapp.com

Agent: 
[SCAN] Analizando 24 páginas...
[RESULTS] 18 issues encontrados:

❌ CRITICAL (3):
- Missing meta description en 5 páginas
- Open Graph image no optimizada

⚠️ WARNING (8):
- Twitter Card incomplete
- Canonical tags inconsistentes

ℹ️ INFO (7):
- Mejoras de best practices
```

### Generar meta tags optimizados

```bash
You: /seo-optimize src/pages --og --twitter

Agent:
[GENERATE] Creando meta tags...
- src/pages/home.tsx → meta tags generados
- src/pages/products/[id].tsx → Open Graph dinámico
- src/pages/blog/[slug].tsx → Twitter Card schema

[FILES] 3 archivos actualizados
[VALIDATION] ✅ 100% compliance
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios mayores, abre primero un issue.

```bash
git checkout -b feature/tu-feature
bun test
git push origin feature/tu-feature
```

## 📄 Licencia

MIT - Ver [LICENSE](./LICENSE)

## 🔗 Enlaces

- [gstack](https://github.com/garrytan/gstack) - Arquitectura base
- [React Helmet](https://github.com/nfl/react-helmet) - Gestión de head en React
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

## 📧 Soporte

¿Preguntas? Abre un [GitHub Issue](https://github.com/mollicris/agent-seo/issues)

---

**Made with ❤️ by [@mollicris](https://github.com/mollicris)**
