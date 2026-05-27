# 🔍 Agent SEO - Optimizador de Meta Tags y Open Graph

Agente IA especializado en auditar y optimizar Meta Tags y Open Graph para aplicaciones React + Vite. Siguiendo la arquitectura de [gstack](https://github.com/garrytan/gstack).

## ✨ Características (v0.1.0)

### 📊 Auditorías
- **Meta Tags Validator** - 10 reglas (title, description, viewport, charset, canonical, robots, keywords, lang, etc.)
- **Open Graph Validator** - 10 reglas (og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale, etc.)
- **Twitter Card Validator** - 8 reglas (twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, etc.)
- **Total: 28 reglas automáticas**

### 🤖 Skills para Claude Code
- `/seo-audit` - Auditar URL completa
- `/seo-optimize` - Generar fixes automáticos (próxima versión)
- `/seo-review` - Validar cambios antes de merge (próxima versión)

### 📈 Reports
- Markdown reports con score 0-100
- Clasificación por severidad (Critical, Warning, Info)
- Sugerencias de fixes automáticas
- Extracción de tags existentes

## 🚀 Quick Start (30 segundos)

### Instalación

```bash
# Opción 1: Clone en Claude Code
cd ~/.claude/skills
git clone https://github.com/mollicris/agent-seo.git
cd agent-seo
bash setup.sh
```

### Uso

```
You: /seo-audit https://myapp.com

Agent:
🔍 Escaneando: https://myapp.com
✅ 15 checks passed
⚠️  8 warnings
❌ 3 errores críticos

Score: 67/100

Crítico:
  - og:image:missing (sin imagen para redes sociales)
  - meta description:length (45 chars, mínimo 120)
  - canonical:missing
```

## 📋 Reglas de Validación

### Meta Tags (10)
| Regla | Severidad | Descripción |
|-------|-----------|-------------|
| title:missing | 🔴 Critical | Tag `<title>` es obligatorio |
| title:length | 🟡 Warning | Debe tener 30-60 caracteres |
| description:missing | 🔴 Critical | Meta description obligatoria |
| description:length | 🟡 Warning | Debe tener 120-160 caracteres |
| viewport:missing | 🔴 Critical | Necesario para responsive |
| charset:missing | 🔴 Critical | UTF-8 recomendado |
| canonical:missing | 🟡 Warning | Evita contenido duplicado |
| robots:missing | ℹ️ Info | Controla indexación |
| keywords:missing | ℹ️ Info | Menor importancia en 2024 |
| lang:missing | 🟡 Warning | Importante para accesibilidad |

### Open Graph (10)
| Regla | Severidad | Descripción |
|-------|-----------|-------------|
| og:title:missing | 🔴 Critical | Título para redes sociales |
| og:description:missing | 🔴 Critical | Preview en redes |
| og:image:missing | 🔴 Critical | Imagen obligatoria |
| og:image:size | 🟡 Warning | Debe ser 1200x630px |
| og:url:missing | 🟡 Warning | URL canónica |
| og:type:missing | 🟡 Warning | Defaultea a "website" |
| og:site_name:missing | ℹ️ Info | Para branding |
| og:locale:missing | ℹ️ Info | Defaultea a "en_US" |
| og:image:alt:missing | ℹ️ Info | Accesibilidad |
| og:consistency | 🟡 Warning | Consistencia con page title |

### Twitter Card (8)
| Regla | Severidad | Descripción |
|-------|-----------|-------------|
| twitter:card:missing | 🔴 Critical | Tipo de card (summary, summary_large_image) |
| twitter:title:missing | 🔴 Critical | Título para Twitter |
| twitter:description:missing | 🔴 Critical | Descripción para Twitter |
| twitter:image:missing | 🔴 Critical | Imagen para tweets |
| twitter:site:missing | 🟡 Warning | @handle del sitio |
| twitter:creator:missing | ℹ️ Info | @handle del creador |
| twitter:card:value | 🟡 Warning | Valor válido |
| twitter:image:alt:missing | ℹ️ Info | Alt text (accesibilidad) |

## 🛠️ Uso Programático

```typescript
import { SEOValidator } from '@mollicris/agent-seo'

const seo = new SEOValidator()

// Auditoría completa
const report = seo.auditAll(html, {
  url: 'https://myapp.com',
  title: 'My App',
  description: 'The best app ever',
  image: 'https://myapp.com/og-image.jpg'
})

console.log(`Score: ${report.summary.score}/100`)
console.log(`Issues: ${report.issues.length}`)

// Generar Markdown report
const markdown = seo.formatReport(report)
console.log(markdown)

// Aplicar fixes automáticos
const fixed = seo.applyFixes(html, [
  'og:image:missing',
  'title:length',
  'description:missing'
])
```

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones técnicas y diseño
- [Roadmap](#roadmap) - Fases futuras

## 🗓️ Roadmap

### v0.1.0 (Actual)
- ✅ Meta Tags Validator (10 reglas)
- ✅ Open Graph Validator (10 reglas)
- ✅ Twitter Card Validator (8 reglas)
- ✅ SEOValidator agregador

### v0.2.0
- `/seo-optimize` - Generar código automáticamente
- `/seo-review` - Validar PRs
- Generadores de código TypeScript
- Tests unitarios

### v0.3.0
- Core Web Vitals audit
- Structured Data (schema.org)
- Sitemap/Robots.txt generators
- Lighthouse integration

### v0.4.0+
- Multi-language support
- Analytics dashboard
- Auto-monitoring
- Vite plugin

## 🏗️ Arquitectura

```
SEOValidator (agregador)
├── MetaTagValidator (10 reglas)
├── OpenGraphValidator (10 reglas)
└── TwitterCardValidator (8 reglas)

Cada validador:
- validate(html) → boolean
- getIssues(html) → Issue[]
- extractTags(html) → Record<string, string>
- suggestTags(html, data) → Record<string, string>
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para más detalles.

## 🔐 Seguridad

- ✅ Input validation con Cheerio
- ✅ Output escaping (HTML safe)
- ✅ No externa dependencies en runtime
- ✅ Zod para validación de tipos

## 📦 Tech Stack

- **Language**: TypeScript
- **Runtime**: Bun (⚡ Super rápido)
- **Parsing**: Cheerio (lightweight DOM parser)
- **Validation**: Zod (runtime type checking)
- **Integration**: Claude Code / OpenClaw

## 📊 Performance

```
MetaTagValidator.validate()     ~2ms
OpenGraphValidator.validate()   ~2ms
TwitterCardValidator.validate() ~1ms
SEOValidator.auditAll()         ~8ms

Total (parse + audit 28 rules)  ~15ms
```

## 📝 License

MIT - Libre para usar en tus proyectos

## 🤝 Contributing

Las PRs son bienvenidas. Para cambios mayores, abre un issue primero.

## 📮 Support

¿Preguntas? Abre un [issue en GitHub](https://github.com/mollicris/agent-seo/issues)

---

**Made with ❤️ siguiendo los principios de [gstack](https://github.com/garrytan/gstack)**
